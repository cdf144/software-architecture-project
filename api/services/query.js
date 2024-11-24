const ReadModel = require("./models/read");

class QueryService {
  #readModel;
  redisClient;

  constructor(redisClient) {
    this.#readModel = new ReadModel();
    this.redisClient = redisClient;
  }

  async findOrigin(id) {
    try {
      const cached = await this.redisClient.hGet("id_to_url", id);
      if (cached) {
        console.log("Cache hit!");
        return cached;
      }
      console.log("Cache miss!");

      const record = await this.#readModel.findUrlById(id);
      if (record) {
        await this.redisClient.hSet("id_to_url", id, record.url, { EX: 43200 });
        return record.url;
      }
      return null;
    } catch (err) {
      console.error("Error finding original URL:", err);
      return null;
    }
  }

  async getAllUrls() {
    try {
      const records = await this.#readModel.findAllUrls();
      return records.map((record) => record.get({ plain: true }));
    } catch (err) {
      console.error("Error getting all URLs:", err);
      throw err;
    }
  }
}

module.exports = QueryService;
