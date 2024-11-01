const express = require("express");
const lib = require("./utils");
const app = express();
const port = 3000;
const Queue = require("bull");
const myQueue = new Queue("myQueue", "redis://localhost:6379");

app.get("/short/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const url = await lib.findOrigin(id);
    if (url == null) {
      res.send("<h1>404</h1>");
    } else {
      res.send(url);
    }
  } catch (err) {
    res.send(err);
  }
});

app.post("/create", async (req, res) => {
  try {
    const url = req.query.url;
    const job = await myQueue.add({ url });
    const newID = await job.finished();
    res.send(newID);
  } catch (err) {
    res.send(err);
  }
});

myQueue.process(async (job) => {
  const { url } = job.data;
  try {
    const newId = await lib.shortUrl(url);
    return newId;
  } catch (err) {
    throw err;
  }
});

app.listen(port, () => {
  console.log(`CS1 app listening on port ${port}`);
});
