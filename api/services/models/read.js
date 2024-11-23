const db = require("db/models");

class ReadModel {
  #model;

  constructor() {
    this.#model = db.ShortenedUrl;
  }

  async findUrlById(id) {
    return this.#model.findOne({ where: { id: id } });
  }

  async findUrlByUrl(url) {
    return this.#model.findOne({ where: { url: url } });
  }

  async findAllUrls() {
    return this.#model.findAll({ attributes: ["id", "url"] });
  }
}

module.exports = ReadModel;
