import {should} from "chai"
import {startServer, configureStore} from './helpers/server.js'
import rootReducer from '../src/client/reducers/index.js'
import {ping} from '../src/client/actions/server.js'
import {io} from 'socket.io-client'
import params from '../params.js'

should()

describe('Fake server test', function(){
  let tetrisServer
  before(cb => startServer( params.server, function(err, server){
    tetrisServer = server
    cb()
  }))

  after(function(done){tetrisServer.stop(done)})

  it('should pong', function(done){
    const initialState = {}
    const socket = io(params.server.url)
    const store =  configureStore(rootReducer, socket, initialState, {
      'pong': () =>  done()
    })
    store.dispatch(ping())
  });
});
