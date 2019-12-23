import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { user_addr } from "@/types/user_addr";
import axios from "axios";
import moment from "moment";

const apiRoute =
  "https://nodeblockserver.netlify.com/.netlify/functions/server";

const state = {
  currentBitPrice: 0,
  currentPriceUrl: "https://api.coindesk.com/v1/bpi/currentprice.json",
  pastDayPrice: "https://api.coindesk.com/v1/bpi/historical/close.json",
  userAddresses: Array<user_addr>(),
  priceChange: 0
};

const getters: GetterTree<any, any> = {
  getCurrentBitPrice() {
    return state.currentBitPrice;
  },
  getUserAddresses(): Array<user_addr> {
    return state.userAddresses;
  },
  getPriceChangePercentage(): string {
    return `${state.priceChange}%`;
  }
};
const mutations: MutationTree<any> = {
  changeBitPrice(state, newBitPrice) {
    state.currentBitPrice = newBitPrice;
  },
  addAddress(state, newAddress: user_addr) {
    state.userAddresses.push(newAddress);
  },
  priceChangeUpdate(state, dayOldPrice: number) {
    // nasty
    state.priceChange = Number(
      (
        ((state.currentBitPrice - dayOldPrice) / state.currentBitPrice) *
        100
      ).toFixed(2)
    );
  }
};
const actions: ActionTree<any, any> = {
  async updatedBitPrice({ commit }) {
    let newPrice: number = 0;
    await axios
      .get(state.currentPriceUrl)
      .then(res => {
        newPrice = res.data.bpi.USD.rate_float;
        this.commit("changeBitPrice", newPrice);
      })
      .catch(err => {
        console.error(err);
      });
    return Number(newPrice.toFixed(2));
  },
  async getAddressData({}, address: string) {
    return await axios.get(`${apiRoute}/getAddress`, {
      params: {
        address
      }
    });
  },
  async getPastDayBitPrice({ commit }) {
    let pastDayPrice: number = 0;
    let yesterday: string = moment()
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    await axios
      .get(state.pastDayPrice, {
        params: {
          start: yesterday,
          end: moment()
            .subtract(1, "day")
            .format("YYYY-MM-DD")
        }
      })
      .then(res => {
        pastDayPrice = res.data.bpi[yesterday];
        commit("priceChangeUpdate", pastDayPrice);
      })
      .catch(err => {
        console.error(err);
      });

    return pastDayPrice;
  }
};

export default {
  actions,
  mutations,
  getters,
  state
};
