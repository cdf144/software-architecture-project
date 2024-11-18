const bullmq = require("bullmq");
const lib = require("./utils");

const shortenQueue = new bullmq.Queue("shortenQueue", {
  connection: { host: "localhost", port: 6379 },
});

const shortenQueueEvents = new bullmq.QueueEvents("shortenQueue", {
  connection: { host: "localhost", port: 6379 },
});

const worker = new bullmq.Worker(
  "shortenQueue",
  async (job) => {
    const url = job.data.url;
    const newID = await lib.shortUrl(url);
    return newID;
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);

worker.on("completed", (job) => {
  console.log(
    `Shortening URL ${job.data.url} completed. ID: ${job.returnvalue}`,
  );
});

worker.on("failed", (job, err) => {
  console.log(`Shortening URL ${job.data.url} failed: ${err}`);
});

module.exports = {
  shortenQueue,
  shortenQueueEvents,
};
