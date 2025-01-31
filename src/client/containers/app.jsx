import React from 'react'
import { connect } from 'react-redux'
import flyd from 'flyd'

const App = ({message}) => {
  var number = flyd.stream(5);
  console.log(number());
  console.log(number(7));
  console.log(number());
  return (
    <span>{message}</span>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}
export default connect(mapStateToProps, null)(App)


