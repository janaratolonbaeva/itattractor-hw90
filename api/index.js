const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');
const app = express();
require ('express-ws')(app);

app.use(cors());

const port = 8000;

const activeConnections = {};

app.ws('/canvas', function (ws, req) {
  const id = nanoid();
  console.log('client connected! id=', id);
  activeConnections[id] = ws;

  ws.on('message', msg => {
    const decoded = JSON.parse(msg)

    if (decoded.type === 'CREATE_CANVAS') {
      Object.keys(activeConnections).forEach(key => {
        const connection = activeConnections[key];

        connection.send(JSON.stringify({
          type: 'NEW_CANVAS',
          canvas: decoded.canvas
        }))
      })
    }
  });

  ws.on('close', () => {
    console.log('client disconnected! id=', id);
    delete activeConnections[id];
  })
});

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});



