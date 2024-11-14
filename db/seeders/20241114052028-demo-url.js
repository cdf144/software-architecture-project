"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("ShortenedUrls", [
      {
        id: "abcde",
        url: "https://www.google.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "fghij",
        url: "https://www.facebook.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "klmno",
        url: "https://www.twitter.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("ShortenedUrls", {
      id: ["abcde", "fghij", "klmno"],
    });
  },
};
