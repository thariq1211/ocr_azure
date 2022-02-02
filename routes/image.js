const express = require("express");
const Router = express.Router();
const sharp = require("sharp");

async function manipulation(img) {
	return await sharp(img)
		.grayscale()
		// .flatten({ background: "#92a9b6" })
		.sharpen(10.0)
		.resize({ width: 800 })
		.normalise()
		.modulate({
			brightness: 1,
			saturation: 2,
		})
		// .resize({ width: 768, height: 424 })
		.png()
		.toFile("result3.jpeg");
}

Router.get("/", async (req, res) => {
	try {
		const result = await manipulation(`${process.cwd()}/lalu.jpg`);
		console.log(result);
		res.send(result);
	} catch (error) {
		res.send(error);
	}
});

module.exports = Router;
