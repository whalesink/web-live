const express = require("express");
const expressWebSocket = require("express-ws");
/** @types {Ffmpeg} */
const ffmpeg = require("fluent-ffmpeg");
const webSocketStream = require("websocket-stream/stream");
const chalk = require("chalk");

const port = 88;
const log = console.log;

ffmpeg.setFfmpegPath(
	`${__dirname}/third-party/ffmpeg-6.0-full_build/bin/ffmpeg`
);

ffmpeg.setFfprobePath(
	`${__dirname}/third-party/ffmpeg-6.0-full_build/bin/ffprobe`
);

const localServer = () => {
	let app = express();
	app.use(express.static(__dirname));
	expressWebSocket(app, null, {
		perMessageDeflate: true,
	});
	app.ws("/rtsp", streamRequestHandle);
	app.listen(port);
	log(`express listening on port ${chalk.blue(port)}`);
};

const streamRequestHandle = (ws, req) => {
	console.log("stream request handle");
	const stream = webSocketStream(
		ws,
		{
			binary: true,
			browserBufferTimeout: 1000,
		},
		{
			browserBufferTimeout: 1000,
		}
	);

	let url = req.query.url;
	log(`${chalk.yellow("stream url:")} ${url}`);
	log(`${chalk.yellow("stream params:")} ${req.params}`);

	try {
		ffmpeg(url)
			// .addInputOption("-b:v", "64k")
			.on("start", function () {
				log(
					`${chalk.underline(url)} ${chalk.green("Stream started.")}`
				);
			})
			.on("codecData", function () {
				// 摄像机在线处理
				log(
					`${chalk.underline(url)} ${chalk.green(
						"Stream codecData."
					)}`
				);
			})
			.on("error", function (err) {
				log(
					`${chalk.underline(url)} has an error occured:\n${chalk.red(
						err.message
					)}`
				);
			})
			.on("end", function () {
				// 摄像机断线的处理
				log(`${chalk.underline.red(url)} Stream end!`);
			})
			.fps(29.7)
			.outputFormat("flv")
			.videoCodec("copy")
			// .noAudio()
			.pipe(stream);
	} catch (error) {
		log(chalk.red(error));
	}
};

localServer();
