// Modulos
const http = require('http');
const mysql = require('mysql');
const db = require('./api_usuarios/db_manager');
const {server_host, server_api_usuarios_port, database_mysql, getFecha} = require('./opciones');
const router = require('./api_usuarios/router');

// Conectar base de datos MYSQL

const connection = mysql.createConnection(database_mysql);
db.conectar(connection);

// Crear Server
const server_api_usuarios = http.createServer( (req,res) => {
    const fecha = getFecha();
    console.log(`API USUARIOS | ${fecha.dia} | ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
    router(connection,req,res);
});

// Conectar Server y ponerlo a "escuchar"
server_api_usuarios.listen(server_api_usuarios_port, server_host, () => {
    const fecha = getFecha();
    console.log(`* Server REST API USUARIOS  | ${fecha.dia} | ${fecha.hora} | Conectado en http://${server_host}:${server_api_usuarios_port} *`)
})