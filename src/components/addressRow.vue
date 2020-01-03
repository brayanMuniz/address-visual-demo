<template>
  <div class="card-group" :class="chartClasses">
    <!-- Could make each one of these a compoennt  -->
    <div class="card mx-3 p-0" v-if="show">
      <div class="card-body">
        <!-- Todo: adjust button to the right  -->
        <h5 class="card-title">
          Amount Traded
          <div class="input-group">
            <div class="input-group-prepend">
              <button
                class="btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >Transaction</button>
              <div class="dropdown-menu">
                <a class="dropdown-item" @click="addTransaction(true)" href="#">Buy</a>
                <a class="dropdown-item" @click="addTransaction(false)" href="#">Sell</a>
              </div>
            </div>
            <input
              type="text"
              placeholder="Amount To Trade"
              v-model="amountTrade"
              class="form-control"
            />
            <input
              type="text"
              placeholder="At Price Per Bitcoin"
              v-model="priceAtTransaction"
              class="form-control"
            />
          </div>
        </h5>
        <BarChart :chartData="chart.amountChart" :style="myStyles" />
      </div>
    </div>
    <div class="card mx-3 p-0 border-left" v-if="show">
      <div class="card-body">
        <h5 class="card-title">Profit</h5>
        <BarChart :chartData="chart.profitChart" />
      </div>
    </div>
    <div class="card mx-3 p-0 border-left" v-if="show">
      <div class="card-body">
        <h5 class="card-title">
          Quick Look
          <a @click="show = !show" href="#">
            <font-awesome-icon :icon="['fa','chevron-up']" />
          </a>
        </h5>
        <div class="table-wrapper-scroll-y custom-scrollbar">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Price</th>
                <th scope="col">$Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(transaction, index) in chart.tableTransactions" :key="index">
                <th scope="row">{{transaction.date}}</th>
                <td>{{transaction.amountCrypto}}</td>
                <td>{{transaction.priceAtTime}}</td>
                <!-- add the negative sign on the left side of money sign  -->
                <td>${{transaction.amountDollars}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div>Break Even: ${{chart.quickData.breakEven}}</div>
          <div>{{chart.quickData.totalTransactions}} transactions.</div>
          <div
            class="text-danger"
          >Spent: {{trim(chart.baseAddrFormatedData.profitability.dollarsSpent, 2)}}</div>
          <div
            v-if="chart.quickData.endProfit > 0"
            class="text-success"
          >You have made ${{chart.quickData.endProfit}}</div>
          <div v-else class="text-danger">You have lost ${{-chart.quickData.endProfit}} on Bitcoin.</div>
        </div>
      </div>
    </div>
    <div class="card mx-3" v-else>
      <div class="row no-gutters">
        <div class="col px-0 mx-0">
          <div class="card-body px-0 mx-0">
            <h5 class="card-title px-0 mx-0">
              {{trimmedAddress(chart.baseAddrFormatedData.address)}}
              <a
                @click="show = !show"
                href="#"
              >
                <font-awesome-icon :icon="['fa','chevron-down']" />
              </a>
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {
  totalDataType,
  dataSetsType,
  userFormatedData,
  tableTransactionsType,
  quickData
} from "@/types/chartDataTypes";
import { user_addr, neededData } from "@/types/user_addr";
import BarChart from "@/components/barChart.vue";
import moment from "moment";
export default Vue.extend({
  name: "addressRow.vue",
  data() {
    return {
      show: Boolean(),
      cardGroupClass: Object(),
      amountTrade: Number(),
      priceAtTransaction: Number(),
      chart: {} as userFormatedData
    };
  },
  props: {
    initialAddressData: Object as () => user_addr
  },
  created() {
    this.show = true;
    this.amountTrade = this.initialAddressData.profitability.finalBalance;
    this.priceAtTransaction = 20000;
    if (this.initialAddressData) {
      this.renderChart(this.initialAddressData);
    }
  },
  methods: {
    addTransaction(buy: boolean) {
      let formatedData: neededData = {
        time: moment().format("YYYY-MM-DD"),
        btc: buy ? Number(this.amountTrade) : -Number(this.amountTrade),
        priceAtTransaction: this.priceAtTransaction,
        received: buy,
        fromAddresses: []
      };
      let newAddr = this.chart.baseAddrFormatedData;
      newAddr.addTransaction(formatedData);
      this.renderChart(newAddr);
    },
    renderChart(newAddr: user_addr) {
      this.show = false;
      let userFormatedData: userFormatedData = {
        baseAddrFormatedData: newAddr,
        amountChart: this.addAmountChart(newAddr),
        profitChart: this.addProfitabilityChart(newAddr),
        tableTransactions: this.addUserTable(newAddr),
        quickData: this.addQuickData(newAddr)
      };
      this.chart.baseAddrFormatedData = userFormatedData.baseAddrFormatedData;
      this.chart.amountChart = userFormatedData.amountChart;
      this.chart.profitChart = userFormatedData.profitChart;
      this.chart.tableTransactions = userFormatedData.tableTransactions;
      this.chart.quickData = userFormatedData.quickData;
      this.show = true;
    },
    collapseCard() {
      for (let key in this.cardGroupClass) {
        if (this.cardGroupClass[key]) {
          this.cardGroupClass[key] = this.show;
        }
      }
    },
    addUserTable(address: user_addr): Array<tableTransactionsType> {
      let tableList: Array<tableTransactionsType> = [];
      address.formatedTransactions.forEach(tr => {
        tableList.push({
          date: tr.time,
          amountCrypto: Number(tr.btc.toFixed(6)),
          priceAtTime: Math.floor(tr.priceAtTransaction),
          amountDollars: Number(-(tr.priceAtTransaction * tr.btc).toFixed(2))
        });
      });
      return tableList;
    },
    addQuickData(address: user_addr): quickData {
      let endProfit: number = 0;
      address.formatedTransactions.forEach(tr => {
        endProfit -= tr.btc * tr.priceAtTransaction;
      });
      let quickData: quickData = {
        breakEven: Math.floor(address.profitability.breakEven),
        totalTransactions: address.formatedTransactions.length,
        endProfit: Math.floor(endProfit),
        address: address.address
      };
      return quickData;
    },
    addProfitabilityChart(address: user_addr): totalDataType {
      let profitChart: totalDataType = {
        labels: [],
        datasets: []
      };
      let loss: string = "rgba(255, 99, 132, 0.5)";
      let gain: string = "rgba(54, 162, 235, 0.5)";
      let backgroundColorList: Array<string> = [];
      let profitYAxis: Array<number> = [];
      let totalMade: number = 0;
      address.formatedTransactions.forEach(tr => {
        profitChart.labels.push(tr.time);
        totalMade -= tr.btc * tr.priceAtTransaction;
        profitYAxis.push(totalMade);
        if (totalMade > 0) {
          backgroundColorList.push(gain);
        } else {
          backgroundColorList.push(loss);
        }
      });
      let formatedDataType: dataSetsType = {
        label: `${address.address}`,
        data: profitYAxis,
        backgroundColor: backgroundColorList
      };
      profitChart.datasets.push(formatedDataType);
      return profitChart;
    },
    addAmountChart(address: user_addr): totalDataType {
      let chartDataType: totalDataType = {
        labels: [],
        datasets: []
      };
      let allTransactionsTotal: Array<number> = [];
      let total: number = 0;
      let withdrawl: string = "rgba(255, 99, 132, 0.5)"; // light red
      let deposit: string = "rgba(54, 162, 235, 0.5)"; // light blue
      let backgroundColorList: Array<string> = [];
      address.formatedTransactions.forEach((transaction, index) => {
        if (transaction.btc > 0) {
          backgroundColorList.push(deposit);
        } else {
          backgroundColorList.push(withdrawl);
        }
        total += transaction.btc;
        allTransactionsTotal.push(total);
        chartDataType.labels.push(transaction.time);
      });
      let formatedDataType: dataSetsType = {
        label: `${address.address}`,
        data: allTransactionsTotal,
        backgroundColor: backgroundColorList
      };
      chartDataType.datasets.push(formatedDataType);
      return chartDataType;
    },
    trimmedAddress(address: string) {
      if (this.show == false) {
        return `${address.substring(0, 15)}...`;
      }
      return address;
    },
    trim(number: number, amount: number) {
      console.log(number, amount);
      if (number > 0 && amount > 0) {
        return `$${number.toFixed(amount)}`;
      }
    }
  },
  computed: {
    myStyles() {
      return {
        // backgroundColor: "grey"
      };
    },
    chartClasses() {
      if (this.show) {
        return {
          "w-100": true,
          "col-12": true
        };
      }
      return {
        "w-50": true,
        col: true
      };
    }
  },
  components: {
    BarChart
  }
});
</script>

<style lang="scss" scoped>
.table-wrapper-scroll-y {
  display: block;
}
.custom-scrollbar {
  position: relative;
  // Todo: update this part with em etx
  height: 400px;
  overflow: auto;
}
</style>

