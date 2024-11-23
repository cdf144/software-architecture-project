const bullmq = require("bullmq");
const redis = require("redis");
const CommandService = require("./services/command");
const QueryService = require("./services/query");

// CQRS & Cache-Aside
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

const commandService = new CommandService(redisClient);
const queryService = new QueryService(redisClient);

const shortenQueue = new bullmq.Queue("shortenQueue", {
  connection: { host: "localhost", port: 6379 },
});
const shortenQueueEvents = new bullmq.QueueEvents("shortenQueue", {
  connection: { host: "localhost", port: 6379 },
});
const shortenWorker = new bullmq.Worker(
  "shortenQueue",
  async (job) => {
    const url = job.data.url;
    const newID = await commandService.shortUrl(url);
    return newID;
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);
shortenWorker.on("completed", (job) => {
  console.log(
    `Shortening URL ${job.data.url} completed. ID: ${job.returnvalue}`,
  );
});
shortenWorker.on("failed", (job, err) => {
  console.log(`Shortening URL ${job.data.url} failed: ${err}`);
});

const findQueue = new bullmq.Queue("findQueue", {
  connection: { host: "localhost", port: 6379 },
});
const findQueueEvents = new bullmq.QueueEvents("findQueue", {
  connection: { host: "localhost", port: 6379 },
});
const findWorker = new bullmq.Worker(
  "findQueue",
  async (job) => {
    const id = job.data.id;
    const url = await queryService.findOrigin(id);
    return url;
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);

const listQueue = new bullmq.Queue("listQueue", {
  connection: { host: "localhost", port: 6379 },
});
const listQueueEvents = new bullmq.QueueEvents("listQueue", {
  connection: { host: "localhost", port: 6379 },
});
const listWorker = new bullmq.Worker(
  "listQueue",
  async () => {
    const records = await queryService.getAllUrls();
    return records;
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);

module.exports = {
  shortenQueue,
  shortenQueueEvents,
  findQueue,
  findQueueEvents,
  listQueue,
  listQueueEvents,
};
