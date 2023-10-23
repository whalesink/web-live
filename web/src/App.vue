<template>
	<div
		class="live-stream-video-wrap"
		ref="wrapRef"
		:style="{
			left: posL,
			top: posT,
			right: posR,
			bottom: posB,
			width: `${outWidth}px`,
			height: `${outHeight}px`,
		}"
	>
		<div class="edge-handle-l" @mousedown="edgeDrag"></div>
		<div class="live-container">
			<div class="topbar" @mousedown="dragStart">实时画面</div>
			<video class="live-video" ref="playerRef" autoplay></video>
		</div>
	</div>
</template>
<script lang="ts">
	import { defineComponent, onMounted, ref } from "vue";
	import flv from "flv.js";

	const ASPECT_RATIO = 1.69; // 710 / 400
	const rtsp = "";
	// const rtsp = "rtmp://ns8.indexforce.com/home/mystream";
	// const rtsp = "rtmp://58.200.131.2:1935/livetv/hunantv";
	// const rtsp = "rtsp://admin:digitalsalt2022@1.117.73.226:11554/stream2";
	// const rtsp = "rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp";

	export default defineComponent({
		setup() {
			const wrapRef = ref<HTMLDivElement>();
			const playerRef = ref<HTMLVideoElement>();
			const player = ref<flv.Player>();
			const posL = ref<string>();
			const posT = ref<string>();
			const posR = ref<string>();
			const posB = ref<string>();
			const outWidth = ref<number>();
			const outHeight = ref<number>();

			const getLiveStream = () => {
				if (flv.isSupported()) {
					if (playerRef.value) {
						player.value = flv.createPlayer({
							type: "flv",
							isLive: true,
							url: `ws://localhost:88/rtsp/?url=${rtsp}`,
						});

						player.value.attachMediaElement(playerRef.value);

						try {
							player.value.load();
							player.value.play();
						} catch (error) {
							console.log(error);
						}
					}
				}
			};

			const edgeDrag = (e: MouseEvent) => {
				if (!wrapRef.value) return;
				const mouseX = e.clientX;
				const boxWidth = wrapRef.value.offsetWidth;

				const cw = document.documentElement.clientWidth;
				const ch = document.documentElement.clientHeight;

				const pinR = cw - (wrapRef.value.offsetLeft + boxWidth);
				const pinB =
					ch - (wrapRef.value.offsetTop + wrapRef.value.offsetHeight);

				const resizeLiveBox = (event: MouseEvent) => {
					if (!wrapRef.value) return;

					const left = event.clientX;
					let offsetX = boxWidth + mouseX - left;

					if (offsetX < 200) offsetX = 200;
					if (offsetX > 1200) offsetX = 1200;

					outWidth.value = offsetX;
					outHeight.value = offsetX / ASPECT_RATIO;

					posL.value = "auto";
					posT.value = "auto";

					posR.value = pinR + "px";
					posB.value = pinB + "px";

					console.log(pinR, pinB);
				};

				document.addEventListener("mousemove", resizeLiveBox, false);
				document.addEventListener(
					"mouseup",
					() => {
						document.removeEventListener(
							"mousemove",
							resizeLiveBox,
							false
						);
					},
					false
				);
			};

			const dragStart = (e: MouseEvent) => {
				if (!wrapRef.value) return;

				const ol = e.clientX - wrapRef.value.offsetLeft;
				const ot = e.clientY - wrapRef.value.offsetTop;

				const moveLiveBox = (event: MouseEvent) => {
					if (!wrapRef.value) return;

					const left = event.clientX;
					const top = event.clientY;

					const boundaryX =
						document.documentElement.clientWidth -
						wrapRef.value.clientWidth;
					const boundaryY =
						document.documentElement.clientHeight -
						wrapRef.value.clientHeight;

					let x = left - ol;
					if (x < 0) x = 0;
					if (x > boundaryX) x = boundaryX;

					let y = top - ot;
					if (y < 0) y = 0;
					if (y > boundaryY) y = boundaryY;

					posL.value = `${x}px`;
					posT.value = `${y}px`;
				};

				document.addEventListener("mousemove", moveLiveBox, false);
				document.addEventListener(
					"mouseup",
					() => {
						document.removeEventListener(
							"mousemove",
							moveLiveBox,
							false
						);
					},
					false
				);
			};

			onMounted(() => {
				getLiveStream();
			});

			return {
				playerRef,
				wrapRef,
				posL,
				posT,
				posR,
				posB,
				outWidth,
				outHeight,
				dragStart,
				edgeDrag,
			};
		},
	});
</script>

<style scoped lang="scss">
	.live-stream-video-wrap {
		width: 710px;
		height: 420px;
		background-color: rgba(126, 126, 126, 0.486);
		position: absolute;
		right: 10px;
		bottom: 10px;
		user-select: none;

		.edge-handle-l {
			background-color: transparent;
			position: absolute;
			z-index: 1;
			top: 0;
			left: 0;
			width: 4px;
			height: 100%;
			cursor: ew-resize;
			transition: all 0.2s;

			&:hover {
				width: 6px;
				background-color: #6c69ff;
			}
		}

		.live-container {
			height: 100%;
			display: flex;
			flex-direction: column;
			.topbar {
				padding: 8px 10px;
				color: #fff;
				font-size: 16px;
				background-color: #0a997d;
				cursor: move;
			}

			.live-video {
				position: relative;
				background-color: #fff;
				width: 100%;
				box-shadow: #0d463a inset 0px 0px 40px;
				object-fit: cover;
				flex-grow: 1;
			}
		}
	}
</style>
