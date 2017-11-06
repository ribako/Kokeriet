import { Line } from 'vue-chartjs';

export default {
  extends: Line,
  data() {
    return {
      datacollection: {
        // Data to be represented on x-axis
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
          label: 'Kondomer',
          backgroundColor: '#f87979',
          pointBackgroundColor: 'white',
          borderWidth: 1,
          pointBorderColor: '#249EBF',
          // Data to be represented on y-axis
          data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100],
        }, {
          label: 'AntiHiv 900',
          backgroundColor: '#f12373',
          pointBackgroundColor: 'white',
          borderWidth: 1,
          pointBorderColor: '#343EBF',
          data: [20, 40, 30, 10, 0, 80, 40, 20, 10, 0, 0, 0],
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
    };
  },
  mounted() {
    // renderChart function renders the chart with the datacollection and options object.
    this.renderChart(this.datacollection, this.options);
  },
};

