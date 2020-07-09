import axios from 'axios';
import Chart from 'chart.js';
import React, { Component, createRef } from 'react';

class Canvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      colors: {
        red: '#FF0000',
        orange: '#FFA500',
        yelllow: '#FFFF00',
        green: '#008000',
        blue: '#0000FF',
        indigo: '#4B0082',
        violet: '#EE82EE',
        black: '#000000',
      },
    };

    this.ref = createRef();
  }

  async componentDidMount() {
    try {
      const response = await axios.get('/bpi');
      const { data } = response;
      const { colors } = this.state;
      const colorCodes = Object.values(colors);

      const datasets = Object.entries(data).reduce((accumulator, [label, points], index) => {
        accumulator.push({
          label,
          borderColor: colorCodes[index],
          data: points,
          pointBackgroundColor: colorCodes[index],
          fill: false,
          showLine: true,
        });

        return accumulator;
      }, []);

      const ctx = this.ref.current;
      const config = {
        type: 'scatter',
        data: {
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          title: {
            display: true,
            text: 'Bitcoin Price Index (BPI)',
          },
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: 'YYYY-MM-DD',
                },
              },
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Day (YYYY-MM-DD)',
              },
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Price (USD)',
              },
            }],
          },
        },
      };

      // new keyword is required.
      new Chart(ctx, config);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <canvas id="chart" ref={this.ref} />
    );
  }
}

export default Canvas;
