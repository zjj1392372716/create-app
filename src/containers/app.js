import React from 'react';
import './index.scss';
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate() {}

  render() {
    return (
      <div className='app'>
        app111
        <img src='../assets/images/1.jpg' alt='img' />
      </div>
    );
  }
}
