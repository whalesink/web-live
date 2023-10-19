import { createApp } from "vue";
import App from "./App.vue";

const injectContent = () => {
	const root = document.createElement("div");
	root.id = "live-stream-outlet-wrap";
	document.body.append(root);

	createApp(App).mount("#live-stream-outlet-wrap");
};

injectContent();
