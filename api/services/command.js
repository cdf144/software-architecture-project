const ReadModel = require("./models/read");
const WriteModel = require("./models/write");

class CommandService {
  #writeModel;
  #readModel;
  redisClient;

  constructor(redisClient) {
    this.#writeModel = new WriteModel();
    this.#readModel = new ReadModel();
    this.redisClient = redisClient;
  }

  async shortUrl(url) {
    let originUrl = await this.redisClient.hGet("url_to_id", url);

    if (originUrl) {
      console.log("Cache hit!");
      await this.#cacheUrl(originUrl, url);
      return originUrl;
    }

    console.log("Cache miss!");
    originUrl = await this.#readModel.findUrlByUrl(url);

    if (originUrl) {
      console.log("URL already exists.");
      await this.#cacheUrl(originUrl.id, url);
      return originUrl.id;
    }

    let newID = await this.#makeID(5);
    try {
      await this.#writeModel.createShortenedUrl(newID, url);
      await this.#cacheUrl(newID, url);
      return newID;
    } catch (err) {
      console.error("Error creating shortened URL:", err);
      throw err;
    }
  }

  async #cacheUrl(id, url) {
    await this.redisClient.hSet("id_to_url", id, url, { EX: 43200 });
    await this.redisClient.hSet("url_to_id", url, id, { EX: 43200 });
  }

  async #makeID(length) {
    while (true) {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength),
        );
        counter += 1;
      }
      if ((await this.#readModel.findUrlById(result)) == null) {
        return result;
      }
    }
  }
}

module.exports = CommandService;
