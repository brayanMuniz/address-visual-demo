
<script >
import Vue from "vue";
import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  name: "lineChart",
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: {
        labels: [],
        datasets: []
      }
    },
    options: {
      type: Object,
      default: null
    }
  },
  mounted() {
    console.log(this.chartData);
    this.renderChart(this.chartData, {});
  }
};
</script>
