const express = require("express");
const router = express.Router();
const computerVisionClient = require("./../helpers/computerVision");
const {
  readTextFromURL,
  printRecText,
  searchInArray,
} = require("./../helpers");

router.get("/", (req, res) => {
  res.sendStatus(204);
});

router.post("/scan_ktp", async (req, res) => {
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

module.exports = router;
