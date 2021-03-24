const express = require("express");
const router = express.Router();
const computerVisionClient = require("./../helpers/computerVision");
const { createWorker, createScheduler } = require("tesseract.js");
const {
  readTextFromURL,
  printRecText,
  searchInArray,
} = require("./../helpers");

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
  if (ktp_url) {
    const scheduler = createScheduler();
    const worker1 = createWorker({
      logger: (m) =>
        console.log(
          "worker1: ",
          m.status,
          " ",
          Math.round(m.progress * 100, 2)
        ),
      errorHandler: (err) => console.log(err.message),
    });
    const worker2 = createWorker({
      logger: (m) =>
        console.log(
          "worker2: ",
          m.status,
          " ",
          Math.round(m.progress * 100, 2)
        ),
      errorHandler: (err) => console.log(err.message),
    });
    try {
      await worker1.load();
      await worker2.load();

      await worker1.loadLanguage("eng+ind");
      await worker2.loadLanguage("eng+ind");

      await worker1.initialize("eng+ind");
      await worker2.initialize("eng+ind");

      scheduler.addWorker(worker1);
      scheduler.addWorker(worker2);

      const results = await Promise.all(
        Array(2)
          .fill(0)
          .map(() => scheduler.addJob("recognize", ktp_url))
      );
      const output = results[0].data.text.split("\n");
      res.send(output);
      await scheduler.terminate();
    } catch (error) {
      res.send({ message: error.message });
    }
  } else {
    res.send({ message: "ktp_url not defined" });
  }
});

module.exports = router;
