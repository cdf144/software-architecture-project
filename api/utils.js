const db = require("db/models");
const redis = require("redis");

const redisClient = redis.createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

async function makeID(length) {
  while (true) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    if ((await db.ShortenedUrl.findOne({ where: { id: result } })) == null) {
      return result;
    }
  }
}

async function findOrigin(id) {
  try {
    // Check Redis first
    const cached = await redisClient.hGet("id to url", id);
    if (cached != null) {
      console.log("Cache hit");
      return cached;
    }
    console.log("Cache miss");

    const record = await db.ShortenedUrl.findOne({ where: { id: id } });
    if (record) {
      await redisClient.hSet("id to url", id, record.url, { EX: 43200 });
      return record.url;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error finding original URL:", err);
    return null;
  }
}

async function shortUrl(url) {
  let originUrl = { id: await redisClient.hGet("url to id", url) };

  if (!originUrl.id) {
    console.log("Cache miss!");
    originUrl = await db.ShortenedUrl.findOne({ where: { url: url } });
  } else {
    console.log("Cache hit!");
  }
  if (originUrl) {
    console.log("URL already exists");
    await redisClient.hSet("id to url", originUrl.id, url, { EX: 43200 });
    await redisClient.hSet("url to id", url, originUrl.id, { EX: 43200 });
    return originUrl.id;
  }

  let newID = await makeID(5);
  try {
    await db.ShortenedUrl.create({ id: newID, url: url });
    await redisClient.hSet("id to url", newID, url, { EX: 43200 });
    await redisClient.hSet("url to id", url, newID, { EX: 43200 });
    return newID;
  } catch (err) {
    console.error("Error creating shortened URL:", err);
    throw err;
  }
}

async function getAllUrls() {
  try {
    const records = await db.ShortenedUrl.findAll({
      attributes: ["id", "url"],
    });
    return records.map((record) => record.get({ plain: true }));
  } catch (err) {
    console.error("Error fetching URLs:", err);
    throw err;
  }
}

module.exports = {
  findOrigin,
  shortUrl,
  getAllUrls,
};
