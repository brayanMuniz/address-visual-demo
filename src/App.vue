<template>
  <div id="app">
    <navigation
      :listOfAddresses="listOfAddresses"
      :currentBitPrice="currentBitPrice"
      @addAddress="addAddressToList"
      :priceChangePercentage="priceChangePercentage"
    />

    <div class="container-fluid row" v-if="dataLoaded">
      <addressChange
        v-for="(userData, index) in dataCollection"
        :key="index"
        :initialAddressData="userData"
      />
    </div>

    <footer class="footer mt-2 py-4 text-center">
      <div class="container">
        <span class="text-muted">
          Address data is gotten with
          <a href="https://www.blockchain.com/explorer">Blockchain.info</a>
          | Bitcoin Price data gotten with:
          <a
            href="https://www.coindesk.com/"
          >Coindesk.com</a> | Icons possible with:
          <a
            href="https://fontawesome.com/license"
          >https://fontawesome.com/license</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import * as bootstrap from "bootstrap";
import { price_history } from "@/price_history";
import { user_addr, neededData } from "@/types/user_addr";
import {
  totalDataType,
  dataSetsType,
  userFormatedData,
  tableTransactionsType,
  quickData
} from "@/types/chartDataTypes";
import addressChange from "@/components/addressRow.vue";
import navigation from "@/components/navigation.vue";
export default Vue.extend({
  data() {
    return {
      address: "",
      userAddresses: Array<user_addr>(),
      currentBitPrice: 0,
      priceChangePercentage: "0%",
      dataCollection: Array<user_addr>(),
      dataLoaded: false,
      listOfAddresses: Array<string>()
    };
  },
  async mounted() {
    this.dataLoaded = false;
    if (
      this.$store.getters.getCurrentBitPrice === 0 ||
      this.currentBitPrice == 0
    ) {
      this.updateBitCoinPrice();
    }
    await this.addAddressToList("1NJQZhzYac89fDhQCmb1khdjekKNVYLFMY");
    this.dataLoaded = true;
  },
  methods: {
    async updateBitCoinPrice() {
      await this.$store.dispatch("updatedBitPrice").then(res => {
        this.currentBitPrice = res;
      });
      await this.$store.dispatch("getPastDayBitPrice");
      this.priceChangePercentage = this.$store.getters.getPriceChangePercentage;
    },
    addBitcoinPriceToChartCollection() {
      // should be somewhere
      let bitcoinPrice: dataSetsType = {
        label: "BitcoinPrice",
        data: Object.values(price_history),
        backgroundColor: "blue"
      };
    },
    async addAddressToList(address: string) {
      console.log("user attempted to enter ", address);
      if (address.length < 25 || address.length > 50) {
        alert("Enter a valid bitcoin address");
        return "no";
      }
      if (this.listOfAddresses.includes(address)) {
        alert("na G");
      } else {
        this.listOfAddresses.push(address);
        let newAddr = new user_addr(address);
        await newAddr.setTransactions().then(res => {
          this.dataCollection.push(newAddr);
        });
      }
    }
  },
  computed: {
    myStyles() {
      return {
        // backgroundColor: "grey"
      };
    }
  },
  components: {
    addressChange,
    navigation
  }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
</style>
