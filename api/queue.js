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

// POST /create
const shortenQueue = new bullmq.Queue("shortenQueue", {
  connection: { host: "localhost", port: 6379 },
});
const shortenQueueEvents = new bullmq.QueueEvents("shortenQueue", {
  connection: { host: "localhost", port: 6379 },
});
// Competing Consumers with multiple workers
const shortenWorker1 = new bullmq.Worker(
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
shortenWorker1.on("completed", (job) => {
  console.log(
    `Worker 1: Shortening URL ${job.data.url} completed. ID: ${job.returnvalue}`,
  );
});
shortenWorker1.on("failed", (job, err) => {
  console.log(`Worker 1: Shortening URL ${job.data.url} failed: ${err}`);
});

const shortenWorker2 = new bullmq.Worker(
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
shortenWorker2.on("completed", (job) => {
  console.log(
    `Worker 2: Shortening URL ${job.data.url} completed. ID: ${job.returnvalue}`,
  );
});
shortenWorker2.on("failed", (job, err) => {
  console.log(`Worker 2: Shortening URL ${job.data.url} failed: ${err}`);
});

const shortenWorker3 = new bullmq.Worker(
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
shortenWorker3.on("completed", (job) => {
  console.log(
    `Worker 3: Shortening URL ${job.data.url} completed. ID: ${job.returnvalue}`,
  );
});
shortenWorker3.on("failed", (job, err) => {
  console.log(`Worker 3: Shortening URL ${job.data.url} failed: ${err}`);
});

// GET /short/:id
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

// GET /list
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
