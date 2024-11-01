const { UrlShortener } = require('./models');
const redis = require('redis');

const redisClient = redis.createClient();
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();


function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function findOrigin(id) {
    try {
        // Check Redis first
        const cached = await redisClient.get(id);
        if (cached != null) {
            console.log("Cache hit");
            return cached;
        }
        console.log("Cache miss");

        const record = await UrlShortener.findOne({ where: { id: id } });
        if (record) {
            await redisClient.set(id, record.url, { EX: 43200 });
            return record.url;
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error finding original URL:', err);
        return null;
    }
}

async function shortUrl(url) {

    let originUrl = await UrlShortener.findOne({ where: { url: url } });
    if (originUrl) {
        console.log('URL already exists:');
        return originUrl.id;
    }
    let newID = makeID(5);
    try {
        await UrlShortener.create({ id: newID, url: url });
        await redisClient.set(newID, url, { EX: 43200 });
        return newID;
    } catch (err) {
        console.error('Error creating shortened URL:', err);
        throw err;
    }
}

async function getAllUrls() {
    try {
        const records = await UrlShortener.findAll({
            attributes: ['id', 'url'],
        });
        return records.map(record => record.get({ plain: true }));
    } catch (err) {
        console.error("Error fetching URLs:", err);
        throw err;
    }
}

module.exports = {
    findOrigin,
    shortUrl,
    getAllUrls
}