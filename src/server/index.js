import fs  from 'fs';
import debug from 'debug';

const logerror = debug('tetris:error')
  , loginfo = debug('tetris:info');

const initApp = (app, params, cb) => {
  const {host, port} = params;
  const handler = (req, res) => {
    if (req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'} );
      var file = '/../../favicon.ico';
    } else if (req.url === '/bundle.js') {
      res.writeHead(200, {'Content-Type': 'application/javascript'} );
      var file = '/../../build/bundle.js';
    } else if (req.url === '/style.css') {
      res.writeHead(200, {'Content-Type': 'text/css'} );
      var file = '/../../style.css';
    } else if (req.url === '/Halstatt.jpg') {
      res.writeHead(200, {'Content-Type': 'image/jpg'} );
      var file = '/../../Halstatt.jpg';
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'} );
      var file = '/../../index.html';
    }

    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      // res.writeHead(200);
      res.end(data);
    });
  };

  app.on('request', handler);

  app.listen({host, port}, () =>{
    loginfo(`tetris listen on ${params.url}`);
    cb();
  });
};

const initEngine = io => {
  io.on('connection', function(socket){
    loginfo("Socket connected: " + socket.id);
    socket.on('action', (action) => {
      if(action.type === 'server/ping'){
        socket.emit('action', {type: 'pong'});
      }
    });
  });
};

import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

export function create(params){
  const promise = new Promise( (resolve, reject) => {
    try {
      const app = createServer();
      initApp(app, params, () => {
        const io = new SocketIO(app, {
          cors: {
            origin: '*',
          }
        });

        io.on("connection", (socket) => {
          console.log("A user connected:", socket.id);
        
          // // Listen for messages from the client
          // socket.on("sendMessage", (message) => {
          //   console.log("Message received:", message);
        
          //   // Broadcast the message to all clients
          //   io.emit("receiveMessage", message);
          // });

          socket.on("rename", (new_name) => {});
          socket.on("new_room", () => {socket.emit("new_room", {room_id: 1});});
          socket.on("join_room", () => {});
          socket.on("room_list", () => {});
          socket.on("cleared_a_line", (new_score) => {});
          socket.on("next_piece", () => {});

          socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
          });
        });
        
        const stop = (cb) => {
          io.close();
          app.close( () => {
            app.unref();
          });
          loginfo(`Engine stopped.`);
          cb();
        };
  
        initEngine(io);
        resolve({stop});
      });
    } catch (error) {
      reject(`Error while creating the app: ${error.message}`);
    }
  });
  return promise;
}
