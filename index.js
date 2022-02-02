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
const cluster = require("cluster");
const numCpus = require("os").cpus().length;
const ComputerVisionClient =
	require("@azure/cognitiveservices-computervision").ComputerVisionClient;
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
app.use("/api/image", require("./routes/image"));
app.get("/", (req, res) => {
	res.sendStatus(200);
});
const port = process.env.port || 5000;
// if (cluster.isMaster) {
//   for (let i = 0; i < numCpus; i += 1) {
//     cluster.fork();
//   }
// } else {
http.createServer(app).listen(port, () => {
	console.log("server up ", port);
});
// }

// computerVision();
