import { createApp } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookmark as farBookmark,
  faClipboard as farClipboard,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBookmark as fasBookmark,
  faClipboard as fasClipboard,
} from "@fortawesome/free-solid-svg-icons";
import "./style.css";

import App from "./App.vue";

library.add(fasClipboard, fasBookmark, farClipboard, farBookmark);

createApp(App).component("font-awesome-icon", FontAwesomeIcon).mount("#app");
