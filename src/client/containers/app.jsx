import React from 'react'
import { connect } from 'react-redux'

const App = ({message}) => {
  // Create a stream with initial value 5.
  var number = flyd.stream(5);
  // Get the current value of the stream.
  console.log(number()); // logs 5
  // Update the value of the stream.
  console.log(number(7));
  // The stream now returns the new value.
  console.log(number()); // logs 7
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


