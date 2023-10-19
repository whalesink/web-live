<template>
	<!--  -->
	<div
		class="live-stream-video-wrap"
		ref="wrapRef"
		:style="{ left: `${posX}px`, top: `${posY}px` }"
	>
		<div class="topbar" @mousedown="dragStart">实时画面</div>
		<video class="live-stream-video" ref="playerRef" autoplay></video>
	</div>
</template>
<script lang="ts">
	import { defineComponent, onMounted, ref } from "vue";
	import flv from "flv.js";

	const rtsp = "";
	// const rtsp = "rtmp://ns8.indexforce.com/home/mystream";
	// const rtsp = "rtsp://admin:digitalsalt2022@1.117.73.226:11554/stream2";
	// const rtsp = "rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp";

	export default defineComponent({
		setup() {
			const wrapRef = ref<HTMLDivElement>();
			const playerRef = ref<HTMLVideoElement>();
			const player = ref<flv.Player>();
			const posX = ref<number>();
			const posY = ref<number>();

			const getLivingStream = () => {
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

			const dragStart = (e: MouseEvent) => {
				if (!wrapRef.value) return;

				const ol = e.clientX - wrapRef.value.offsetLeft;
				const ot = e.clientY - wrapRef.value.offsetTop;

				document.onmousemove = function (event) {
					if (!wrapRef.value) return;

					// console.log(event);
					const left = event.clientX;
					const top = event.clientY;

					const boundaryX =
						document.documentElement.clientWidth -
						wrapRef.value.clientWidth;
					const boundaryY =
						document.documentElement.clientHeight -
						wrapRef.value.clientHeight;

					if (left - ol < 0) {
						posX.value = 0;
					} else if (left - ol > boundaryX) {
						posX.value = boundaryX;
					} else {
						posX.value = left - ol;
					}

					if (top - ot < 0) {
						posY.value = 0;
					} else if (top - ot > boundaryY) {
						posY.value = boundaryY;
					} else {
						posY.value = top - ot;
					}
				};

				document.onmouseup = function () {
					document.onmousemove = null;

					document.onmouseup = null;
				};
			};

			onMounted(() => {
				window.onresize = () => {
					console.log(
						document.documentElement.clientWidth,
						document.documentElement.clientHeight,
						wrapRef?.value?.clientHeight,
						wrapRef?.value?.clientWidth
					);
				};
				getLivingStream();
			});

			return {
				playerRef,
				wrapRef,
				posX,
				posY,
				dragStart,
			};
		},
	});
</script>

<style scoped lang="scss">
	body {
		position: relative;
	}
	.live-stream-video-wrap {
		width: 710px;
		height: 425px;
		background-color: rgba(126, 126, 126, 0.486);
		// border: 2px solid #b6b6b6;
		position: absolute;
		right: 10px;
		bottom: 50px;
		user-select: none;

		.topbar {
			padding: 8px 10px;
			color: #fff;
			font-size: 16px;
			background-color: #0a997d;
			cursor: move;
		}
		.live-stream-video {
			width: 100%;
			height: 100%;
			object-fit: cover;
			box-shadow: #0d463a inset 0px 0px 40px;
			background-color: #fff;
		}
	}
</style>
