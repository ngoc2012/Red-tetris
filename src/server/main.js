import params  from '../../params.js';
import * as server from './index.js';
import ngrok from "@ngrok/ngrok";
import dotenv from 'dotenv';

dotenv.config();

server.create(params.server).then( () => {
  console.log('not yet ready to play tetris with U ...');
  ngrok.connect({ 
    addr: params.server.port,
    authtoken_from_env: true,
    domain: 'pet-vocal-piranha.ngrok-free.app',
  })
  .then(listener => console.log(`Ingress established at: ${listener.url()}`));
});
