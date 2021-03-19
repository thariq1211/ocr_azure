"use strict";

const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const async = require("async");
const fs = require("fs");
const https = require("https");
const path = require("path");
const createReadStream = require("fs").createReadStream;
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const ocrRoutes = require("./routes/ocr");

function computerVision() {
  async.series(
    [
      async function () {},
      function () {
        return new Promise((resolve) => {
          resolve();
        });
      },
    ],
    (err) => {
      throw err;
    }
  );
}

app.use(express.json());
app.use(cors());
app.use("/api/ocr", ocrRoutes);
const port = process.env.port || 5000;
http.createServer(app).listen(port, () => {
  console.log("server up ", port);
});

// computerVision();
