import {configureStore} from './helpers/server.js'
import rootReducer from '../src/client/reducers/index.js'
import {ALERT_POP, alert} from '../src/client/actions/alert.js'
import {should} from "chai"

const MESSAGE = "message"

should()

describe('Fake redux test', function(){
  it('alert it', function(done){
    const initialState = {}
    const store =  configureStore(rootReducer, null, initialState, {
      ALERT_POP: ({dispatch, getState}) =>  {
        const state = getState()
        state.message.should.equal(MESSAGE)
        done()
      }
    })
    store.dispatch(alert(MESSAGE))
  });

});
