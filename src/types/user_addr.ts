import { price_history } from "@/price_history";
import moment from "moment";
import store from "@/store/store";
let currentBitPrice: number = store.getters.getCurrentBitPrice;
if (currentBitPrice == 0 || currentBitPrice == undefined) {
  store
    .dispatch("updatedBitPrice")
    .then(res => {
      currentBitPrice = res;
    })
    .catch(err => {
      console.log(err);
    });
}
export class user_addr {
  address: string;
  profitability: profitability;
  list_of_transactions: Array<blockChainApiData>;
  formatedTransactions: Array<neededData>;
  constructor(address: string) {
    this.address = address;
    // Todo: add error for when the address breaks
    this.profitability = {
      totalBTCBought: 0,
      totalBTCSold: 0,
      finalBalance: 0,
      dollarsSpent: 0,
      dollarsMade: 0,
      breakEven: 0
    };
    this.list_of_transactions = [];
    this.formatedTransactions = [];
    this.setTransactions()
      .then(res => {
        this.list_of_transactions = res.data.txs.reverse();
        console.log(res.data);
        let firstTimeData: blockchainQuickData = {
          total_received: res.data.total_received / 100000000,
          total_sent: res.data.total_sent / 100000000,
          final_balance: res.data.final_balance / 100000000
        };
        this.setGivenData(firstTimeData);
        this.setFormatedData(this.list_of_transactions);
        this.setProfitability(this.formatedTransactions);
      })
      .catch(err => {
        console.error(err);
      });
  }
  async setTransactions() {
    if (store.state.developerMode) {
      return Promise.resolve(store.state.testData);
    }
    return store.dispatch("getAddressData", this.address);
  }

  setGivenData(givenData: blockchainQuickData) {
    this.profitability.totalBTCBought = givenData.total_received;
    this.profitability.totalBTCSold = Math.abs(givenData.total_sent);
    this.profitability.finalBalance = givenData.final_balance;
  }

  // Todo: add deleteTransaction method. Good luck buddy

  addTransaction(newTr: neededData) {
    // updateGivenData
    let givenData = {
      total_received: this.profitability.totalBTCBought,
      total_sent: this.profitability.totalBTCSold,
      final_balance: this.profitability.finalBalance
    };
    if (newTr.btc > 0) {
      givenData.total_received += newTr.btc;
      givenData.final_balance += newTr.btc;
    } else {
      givenData.total_sent -= newTr.btc;
      givenData.final_balance += newTr.btc;
    }
    this.setGivenData(givenData);
    // updateFormatedData
    this.formatedTransactions.push(newTr);
    //  updateProfitability
    this.setProfitability(this.formatedTransactions);
  }

  setProfitability(formatedTransactions: Array<neededData>) {
    let totalProfitability = {
      dollarsMade: 0,
      dollarsSpent: 0,
      breakEven: 0
    };
    let tempBought: number = 0;
    let tempCount: number = 0;
    formatedTransactions.forEach(tr => {
      if (tr.received) {
        tempCount++;
        tempBought += tr.priceAtTransaction;
        totalProfitability.dollarsSpent += tr.btc * tr.priceAtTransaction;
      } else {
        totalProfitability.dollarsMade = -tr.btc * tr.priceAtTransaction;
      }
    });
    totalProfitability.breakEven = tempBought / tempCount;
    this.profitability.dollarsMade = totalProfitability.dollarsMade;
    this.profitability.dollarsSpent = totalProfitability.dollarsSpent;
    this.profitability.breakEven = totalProfitability.breakEven;
  }

  setFormatedData(blockChainData: Array<blockChainApiData>) {
    let formatedTransactions: Array<neededData> = [];
    blockChainData.forEach(transaction => {
      let date: string = "";
      if (transaction.time) {
        date = moment.unix(transaction.time).format("YYYY-MM-DD");
      }
      let price: number = price_history[date];
      if (!price_history[date]) {
        console.error("HELP");
      }
      let didReceive: boolean = true;
      let totalInTransaction: number = 0;

      if (transaction.out) {
        transaction.out.forEach(outAddr => {
          if (outAddr.addr == this.address) {
            totalInTransaction += outAddr.value / 100000000;
          }
        });
      }

      if (transaction.inputs) {
        transaction.inputs.forEach(inAddr => {
          if (inAddr.prev_out.addr === this.address) {
            totalInTransaction -= inAddr.prev_out.value / 100000000;
          }
        });
      }

      formatedTransactions.push({
        time: date,
        btc: totalInTransaction,
        priceAtTransaction: price,
        fromAddresses: [],
        received: didReceive ? totalInTransaction > 0 : false
      });
    });
    this.formatedTransactions = formatedTransactions;
  }

  removeUnnededTransaction(unfilteredTr: Array<blockChainApiData>) {}

  updateFormatedData(preFormatedData: Array<neededData>) {}
}

export interface neededData {
  time: any;
  btc: number; // total amount, if ingoing false => negative
  fromAddresses?: Array<string>; // Todo: be able to cycle back and get all the information from those.
  priceAtTransaction: number; // cross reference with large file
  result?: number; // ? Why it 0 sometimes though
  received: boolean; // self explanatory
}

interface profitability {
  totalBTCBought: number;
  totalBTCSold: number;
  dollarsSpent: number;
  dollarsMade: number;
  finalBalance: number;
  breakEven: number;
}

interface blockchainQuickData {
  address?: string;
  final_balance: number;
  total_received: number;
  total_sent: number;
}

interface quickGiven {
  totalBought: number;
  totalSold: number;
  finalBalance: number;
}

interface blockChainApiData {
  block_height?: number;
  block_index?: number;
  hash?: string;
  inputs?: Array<inputAddress>;
  out?: Array<outAddress>;
  result?: number;
  time?: number;
}

interface inputAddress {
  prev_out: prev_out;
  script: string;
  witness: string;
}

interface prev_out {
  addr: string;
  spent: boolean;
  value: number;
}

interface outAddress {
  addr: string;
  spent: boolean;
  value: number;
}
