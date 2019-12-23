<template>
  <nav class="navbar navbar-expand-lg bg-dark navbar-dark sticky-top">
    <a class="navbar-brand" href="#">
      Current Price: {{currentBitPrice}}
      <a :class="priceChangeClasses">{{priceChangePercentage}}</a>
    </a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto"></ul>
      <!-- * I learnt how to use emit after a year of vue -->
      <form class="form-inline my-2 my-lg-0" v-on:submit.prevent="$emit('addAddress', address)">
        <input
          class="form-control mr-sm-2"
          type="search"
          placeholder="Enter Address"
          aria-label="Search"
          v-model.trim="address"
        />
      </form>
    </div>
  </nav>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    listOfAddresses: Array,
    currentBitPrice: Number,
    priceChangePercentage: String
  },
  data() {
    return {
      address: ""
    };
  },
  mounted() {},
  methods: {
    addAddress(address: string) {
      console.log(address);
    }
  },
  computed: {
    priceChangeClasses() {
      let negative: boolean = false;
      // could make this a terniary operator
      if (negative) {
        return {
          "text-success": true
        };
      }
      return {
        "text-danger": true
      };
    }
  }
});
</script>
