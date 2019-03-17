// Modulos
const http = require('http');
const mysql = require('mysql');
const db = require('./api_mensajes/db_manager');
const router = require('./api_mensajes/router');
const {server_host, server_api_mensajes_port, database_mysql, getFecha} = require('./opciones');

// Conectar con Base de Datos
const connection = mysql.createConnection(database_mysql);
db.conectar(connection);

// Crear Server
const server_api_mensajes = http.createServer((req,res) => {
    const fecha = getFecha();
    router(connection,req,res);
    console.log(`API MENSAJES | ${fecha.dia} ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
});

// Conectar Server y ponerlo a "escuchar"
server_api_mensajes.listen(server_api_mensajes_port, server_host, () => {
    const fecha = getFecha();
    console.log(`* Server REST API MENSAJES  | ${fecha.dia} ${fecha.hora} | Conectado en http://${server_host}:${server_api_mensajes_port} *`)
})