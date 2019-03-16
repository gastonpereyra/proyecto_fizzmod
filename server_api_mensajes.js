// Modulos
const http = require('http');
const {server_host, server_api_mensajes_port, database_mysql, getFecha} = require('./opciones');

const connection = mysql.createConnection(database_mysql);
// conectar
connection.query('SELECT 1', function (error, results, fields) {
    const fecha = getFecha();
    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${err.message}`);
    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Conectada *`)
  })

// Crear Server
const server_api_mensajes = http.createServer((req,res) => {
    const fecha = getFecha();
    console.log(`API MENSAJES | ${fecha.dia} ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
    res.end("SERVER - REST API : MENSAJES");
});

// Conectar Server y ponerlo a "escuchar"
server_api_mensajes.listen(server_api_mensajes_port, server_host, () => {
    const fecha = getFecha();
    console.log(`* Server REST API MENSAJES  | ${fecha.dia} ${fecha.hora} | Conectado en http://${server_host}:${server_api_mensajes_port} *`)
})