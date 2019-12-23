import { user_addr } from "./user_addr";

export interface userFormatedData {
  baseAddrFormatedData: user_addr;
  amountChart: totalDataType;
  profitChart: totalDataType;
  tableTransactions: Array<tableTransactionsType>;
  quickData: quickData;
}

export interface quickData {
  breakEven: number;
  totalTransactions: number;
  endProfit: number;
  address: string;
}

export interface tableTransactionsType {
  date: string;
  amountCrypto: number;
  priceAtTime: number;
  amountDollars: number;
}

export interface totalDataType {
  labels: Array<string>;
  datasets: Array<dataSetsType>;
  breakEven?: number;
}

export interface dataSetsType {
  label: string;
  backgroundColor?: backgroundColor;
  data: Array<number>;
}

type backgroundColor = string | Array<string>;
