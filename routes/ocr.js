const express = require("express");
const router = express.Router();
const textract = require("textract");
const computerVisionClient = require("./../helpers/computerVision");
const { createWorker, createScheduler } = require("tesseract.js");
const {
	readTextFromURL,
	printRecText,
	searchInArray,
} = require("./../helpers");

let schedulerPost;

async function init() {
	const scheduler = createScheduler();
	const worker1 = createWorker({
		logger: (m) =>
			console.log("worker1: ", m.status, " ", Math.round(m.progress * 100, 2)),
		errorHandler: (err) => console.log(err.message),
	});
	const worker2 = createWorker({
		logger: (m) =>
			console.log("worker2: ", m.status, " ", Math.round(m.progress * 100, 2)),
		errorHandler: (err) => console.log(err.message),
	});
	// const worker3 = createWorker({
	//   logger: (m) => console.log(
	//     "worker3: ",
	//     m.status,
	//     " ",
	//     Math.round(m.progress * 100, 2)
	//   ),
	//   errorHandler: (err) => console.log(err.message),
	// });

	await worker1.load();
	await worker2.load();
	// await worker3.load();

	await worker1.loadLanguage("ind");
	await worker2.loadLanguage("ind");
	// await worker3.loadLanguage("ind");

	await worker1.initialize("ind");
	await worker2.initialize("ind");
	// await worker3.initialize("ind");

	scheduler.addWorker(worker1);
	scheduler.addWorker(worker2);
	// scheduler.addWorker(worker3);
	schedulerPost = scheduler;
}

// init();

router.get("/", (req, res) => {
	res.sendStatus(204);
});

router.post("/azure/scan_ktp", async (req, res) => {
	const { ktp_url } = req.body;
	if (!ktp_url) {
		res.json({ message: "ktp_url is required" });
	} else {
		try {
			const result = await readTextFromURL(computerVisionClient, ktp_url);
			const arrayOutput = printRecText(result);
			const alamatArr = [];
			const getPartAlamat = (array, num) => {
				return array[
					array.indexOf(searchInArray("alamat", array).toString()) + num
				]
					.split(":")
					.pop()
					.trim();
			};
			for (let i = 1; i <= 8; i++) {
				alamatArr.push(getPartAlamat(arrayOutput, i));
			}

			const jsonOutput = {
				provinsi: searchInArray("provinsi", arrayOutput).toString(),
				kabupaten: searchInArray("kabupaten", arrayOutput).toString(),
				nik: arrayOutput[
					arrayOutput.indexOf(searchInArray("nik", arrayOutput).toString()) + 1
				]
					.split(":")
					.pop()
					.trim(),
				nama: arrayOutput[
					arrayOutput.indexOf(searchInArray("nama", arrayOutput).toString()) + 1
				]
					.split(":")
					.pop()
					.trim(),
				jk: arrayOutput[
					arrayOutput.indexOf(
						searchInArray("kelamin", arrayOutput).toString()
					) + 1
				]
					.split(":")
					.pop(),
				alamat: alamatArr.toString().split(",").join(" "),
				ttl: searchInArray("lahir", arrayOutput)
					.toString()
					.split(":")
					.pop()
					.trim(),
				agama: arrayOutput[
					arrayOutput.indexOf(searchInArray("agama", arrayOutput).toString()) +
						1
				]
					.split(":")
					.pop()
					.trim(),
				pekerjaan: arrayOutput[
					arrayOutput.indexOf(
						searchInArray("pekerjaan", arrayOutput).toString()
					) + 1
				]
					.split(":")
					.pop()
					.trim(),
				gol_darah: searchInArray("darah", arrayOutput).toString(),
				status_kawin: searchInArray("status", arrayOutput)
					.toString()
					.split(":")
					.pop()
					.trim(),
				kewarganegaraan: searchInArray("Kewarganegaraan:", arrayOutput)
					.toString()
					.split(":")
					.pop()
					.trim(),
				masa_berlaku: searchInArray("berlaku", arrayOutput).toString(),
			};
			res.send({
				raw: arrayOutput,
				teks: arrayOutput.toString().split(",").join("\n"),
				jsonOutput,
			});
		} catch (error) {
			res.send({ message: error.message });
		}
	}
});

router.post("/tesseract/scan_ktp", async (req, res) => {
	const { ktp_url } = req.body;
	let result;
	if (ktp_url) {
		try {
			const results = await Promise.all(
				Array(2)
					.fill(0)
					.map(() => schedulerPost.addJob("recognize", "./ktp.jpg"))
			);
			const output = results[0].data.text.split("\n");
			result = output;
			// await schedulerPost.terminate();
			res.send(result);
		} catch (error) {
			res.send({ message: error.message });
		}
	} else {
		res.send({ message: "ktp_url not defined" });
	}
});

router.post("/textract/scan_ktp", async (req, res) => {
	try {
		const { ktp_url } = req.body;
		const config = {
			tesseract: { cmd: "-l ind+eng --psm 6" },
			preserveLineBreaks: true,
		};
		textract.fromFileWithPath(
			`${process.cwd()}/result3.jpeg`,
			config,
			function (error, text) {
				if (error) res.send({ message: error.message });
				if (text) {
					// console.log(text.split("\n"));
					res.json({ result: text.split("\n") });
				}
			}
		);
	} catch (error) {
		res.sendStatus(500).send({ message: error.message });
	}
});

module.exports = router;
