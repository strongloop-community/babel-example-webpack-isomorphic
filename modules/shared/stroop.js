import React, { Component, PropTypes } from 'react'
import getRandomColorName from './getRandomColorName'

class Stroop extends Component {
  static propTypes = {
    color: PropTypes.string,
    name: PropTypes.string
  }

  constructor (props) {
    super(props)
    const { name = 'red', color = 'black' } = props
    this.state = { name, color }
  }

  changeColor () {
    this.setState({
      color: getRandomColorName(),
      name: getRandomColorName()
    })
  }

  render () {
    const style = {
      color: this.state.color,
      textAlign: 'center',
      fontSize: 300,
      cursor: 'pointer'
    }

    return (
      <h1 style={style} onClick={::this.changeColor}>
        {this.state.name}
      </h1>
    )
  }
}

export default Stroop
