import Vue from "vue";
import Vuex from "vuex";
import blockchainCalls from "../storeModules/blockchainCalls";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    developerMode: false
  },
  mutations: {},
  actions: {},
  modules: { blockchainCalls }
});
