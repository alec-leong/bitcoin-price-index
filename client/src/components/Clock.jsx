import React, { Component } from 'react';

class Clock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: new Date(),
      options: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000,
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date(),
    });
  }

  render() {
    const { date, options } = this.state;
    return (
      <p>{date.toLocaleTimeString(undefined, options)}</p>
    );
  }
}

export default Clock;
