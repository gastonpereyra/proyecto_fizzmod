// Modulos
const http = require('http');
const io = require('socket.io')(http);
const router = require('./api_web/router');
const {server_host, server_web_port, getFecha} = require('./opciones');

// Crear Server
const server_web = http.createServer((req,res) => {
    const fecha = getFecha();
    console.log(`WEB | ${fecha.dia} | ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
    router(req,res);
});

// Conectar Server y ponerlo a "escuchar"
server_web.listen(server_web_port, server_host, () => {
    const fecha = getFecha();
    console.log(`* Server WEB | ${fecha.dia} | ${fecha.hora} | Conectado en http://${server_host}:${server_web_port} *`)
})

// Websockets

io.on('connection', function(socket){
    const fecha = getFecha();
    // Log cuando se conecta alguien
    console.log(`WEB-SOCKET | ${fecha.dia} | ${fecha.hora}  | Un usuario se conecto`);
    // Log cuando se desconecta alguien
    socket.on('disconnect', function(){
        console.log(`WEB-SOCKET | ${fecha.dia} | ${fecha.hora}  | Un usuario se desconecto`);
      });
  });

