const db = require("db/models");

class WriteModel {
  #model;

  constructor() {
    this.#model = db.ShortenedUrl;
  }

  async createShortenedUrl(id, url) {
    return this.#model.create({ id, url });
  }
}

module.exports = WriteModel;
