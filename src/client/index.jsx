import React from 'react'
import ReactDom from 'react-dom'
import createLogger from 'redux-logger'
import {thunk} from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'                                                                                                                                                    
import {storeStateMiddleWare} from './middleware/storeStateMiddleWare.js'
import reducer from './reducers/index.js'
import App from './containers/app.jsx'
import {alert} from './actions/alert.js'
 
const initialState = {}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
)

ReactDom.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('tetris'))

store.dispatch(alert('Soon, will be here a fantastic Tetris ...'))
