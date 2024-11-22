require("dotenv").config({ path: "../.env" });
const express = require("express");
const lib = require("./utils");
const port = process.env.SERVER_PORT || 3000;
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60, // limit each IP to 60 requests per windowMs
  message: "Too many requests",
});

const app = express();
app.use(cors());
app.use(limiter);

const queue = require("./queue");

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

app.get("/list", async (req, res) => {
  try {
    const records = await lib.getAllUrls();
    res.json(records);
  } catch (err) {
    res.status(500).send("Error retrieving URLs");
  }
});

app.post("/create", async (req, res) => {
  timer = Date.now();
  try {
    const url = req.query.url;
    const job = await queue.shortenQueue.add("shortenUrl", { url });
    const newID = await job.waitUntilFinished(queue.shortenQueueEvents);

    // res.send(newID);
    res.json({
      id: newID,
      original_url: url,
      shortened_url: `http://localhost:3000/short/${newID}`,
    });
  } catch (err) {
    res.send(err);
  }
});

app.listen(port, () => {
  console.log(`CS1 app listening on port ${port}`);
});
