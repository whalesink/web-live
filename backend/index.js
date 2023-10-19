const express = require("express");
const expressWebSocket = require("express-ws");
const ffmpeg = require("fluent-ffmpeg");
const webSocketStream = require("websocket-stream/stream");

const port = 88;

ffmpeg.setFfmpegPath(
	`${__dirname}/third-party/ffmpeg-6.0-full_build/bin/ffmpeg`
);

const localServer = () => {
	let app = express();
	app.use(express.static(__dirname));
	expressWebSocket(app, null, {
		perMessageDeflate: true,
	});
	app.ws("/rtsp", rtspRequestHandle);
	app.listen(port);
	console.log(`express listening on port ${port}`);
};

const rtspRequestHandle = (ws, req) => {
	console.log("rtsp request handle");
	const stream = webSocketStream(
		ws,
		{
			binary: true,
			browserBufferTimeout: 1000000,
		},
		{
			browserBufferTimeout: 1000000,
		}
	);

	let url = req.query.url;
	console.log("rtsp url:", url);
	console.log("rtsp params:", req.params);

	try {
		ffmpeg(url)
			// .addInputOption("-rtsp-transport", "tcp", "-buffer-size", "102400") // 这里可以添加一些 RTSP 优化的参数
			.on("start", function () {
				console.log(url, "Stream started.");
			})
			.on("codecData", function () {
				// 摄像机在线处理
				console.log(url, "Stream codecData.");
			})
			.on("error", function (err) {
				console.log(url, "An error occured: ", err.message);
			})
			.on("end", function () {
				// 摄像机断线的处理
				console.log(url, "Stream end!");
			})
			.outputFormat("flv")
			.videoCodec("copy")
			// .noAudio()
			.pipe(stream);
	} catch (error) {
		console.log(error);
	}
};

localServer();
