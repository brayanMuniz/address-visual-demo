import Vue from "vue";
import App from "./App.vue";
import store from "./store/store";
import { library } from "@fortawesome/fontawesome-svg-core";
import "bootstrap/dist/js/bootstrap.min.js";

import {
  faUserSecret,
  faChevronUp,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faUserSecret, faChevronUp, faChevronDown);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = true;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
