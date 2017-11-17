import { Line, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;


export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};

/*
data() {
  return {
    datacollection: {
      // Data to be represented on x-axis
      labels: ['January', 'February', 'March', 'April', 'May',
       'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [{
        label: 'Kondomer',
        borderColor: '#0016bf', // Color of the line
        backgroundColor: 'rgba(0, 0, 0, 0)', // Makes the fill under the line 100% transparent
        pointBackgroundColor: 'white',
        borderWidth: 1,
        pointBorderColor: '#249EBF',
        // Data to be represented on y-axis
        data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100],
      }, {
        label: 'Min',
        borderDash: [40, 10],
        borderColor: '#bf000a',
        pointRadius: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 1,
        pointBorderColor: '#6d6e6c',
        data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
      }, {
        label: 'Max',
        borderDash: [40, 10],
        borderColor: '#bf000a',
        pointRadius: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 1,
        pointBorderColor: '#6d6e6c',
        data: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
      }],
    },
    // Chart.js options that controls the appearance of the chart
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
          gridLines: {
            display: true,
          },
        }],
        xAxes: [{
          gridLines: {
            display: false,
          },
        }],
      },
      legend: {
        display: true,
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  }; */
