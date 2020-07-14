import axios from 'axios';
import Chart from 'chart.js';
import moment from 'moment';
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
      marketSummaryTimes: {
        '1 day': 2,
        '5 days': 5,
        '1 month': 30,
        '6 months': 180,
        YTD: Math.abs(Date.parse(moment.utc().format('YYYY-MM-DD')) - Date.parse(`${moment.utc().format('YYYY')}-01-01`)) * 10 ** -3 * (1 / 60) * (1 / 60) * (1 / 24), // year to date (YTD) in number of days
        '1 year': 365,
        '5 years': 365 * 5,
        Max: Math.abs(Date.parse(moment.utc().format('YYYY-MM-DD')) - Date.parse(moment('2013-09-01').format('YYYY-MM-DD'))) * 10 ** -3 * (1 / 60) * (1 / 60) * (1 / 24),
      },
    };

    this.ref = createRef();
  }

  async componentDidMount() {
    try {
      const response = await axios.get('/bpi');
      const { data } = response;

      const { marketSummaryTimes } = this.state;
      const { colors } = this.state;
      const colorCodes = Object.values(colors);

      const datasets = Object.entries(marketSummaryTimes).reduce((accumulator, [summary, numDays], index) => {
        accumulator.push({
          label: summary,
          borderColor: colorCodes[index],
          data: data.slice(data.length - numDays, data.length),
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
