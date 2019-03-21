// Modulos
const server_web = require('http').createServer(manejarServerWeb);
const io = require('socket.io')(server_web);
const fetch = require('node-fetch');
// const body_parser = require('../body_parser');
const router = require('./api_web/router');
const {server_host, server_web_port, getFecha} = require('./opciones');

// Crear Server
function manejarServerWeb (req,res) {
    const fecha = getFecha();
    console.log(`[WEB] Proxy | ${fecha.dia} | ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
    router(req,res);
};

// Conectar Server y ponerlo a "escuchar"
server_web.listen(server_web_port, server_host, () => {
    const fecha = getFecha();
    console.log(`[WEB] Server Proxy | ${fecha.dia} | ${fecha.hora} | Conectado en http://${server_host}:${server_web_port} *`)
})

// Websockets

const user_url = 'http://localhost:8080';
const mess_url = 'http://localhost:9090';

io.on('connection', function(socket){
    const fecha = getFecha();
    // Log un cliente entra pero no esta logeado
    console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Un cliente entro`);

    // Cuando se logea
    socket.on('entra_usuario', ({status, payload}) => {
        if (payload.id_usuario) {
            // Conecto con el servidor de Usuarios para cambiar el usuario a conectado
            fetch(`${user_url}?id=${payload.id_usuario}&status=1`,{ method: 'PATCH'})
                // Si todo fue bien, pido ademas todos los usuarios
                .then( response => fetch(`${user_url}`))
                .then( response => response.json())
                .then( ({data}) => {
                    // Le pongo ID del Usuario al socket
                    socket.id_usuario = payload.id_usuario;
                    // Al cliente le mando los usuarios
                    socket.emit('conecto_usuario', {status: 200, payload: {usuarios: data.usuarios}});
                    // A los demas les aviso que se conecto un nuevo usuario
                    socket.broadcast.emit('nuevo_usuario',{status: 200, payload: { id_usuario: payload.id_usuario}});
                    console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ID ${payload.id_usuario} se conecto`);
                })
                .catch(err => {
                    // Aviso al Cliente que no se pudo conectar
                    socket.emit('conecto_usuario', {status: 400, payload: {error: "No se pudo Conectar"}});
                    console.error(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ${payload.id_usuario} intento conectarse pero hubo un error`);
                })
        }
    })

    // cuando mandan un mensaje
    socket.on('manda_mensaje', ({status, payload}) => {

        const nuevo_mensaje = {
            id_usuario : payload.id_usuario,
            cuerpo : payload.cuerpo
        }
        // Conecto con el servidor de Mensajes para ingresarlo
        fetch(mess_url,{ 
                    method: 'POST', 
                    body: JSON.stringify(nuevo_mensaje), 
                    headers:{
                    'Content-Type': 'application/json'
                  }})
            // Si lo respuesta es afirmativa
            .then( response => response.json())
            // Busco todos los datos del mensaje ingresado
            .then( ({data}) => fetch(`${mess_url}?id=${data.mensaje.id_mensaje}`))
            .then( response => response.json())
            .then( ({data})=> {
                    // Obtengo la info del servidor
                    const { mensaje } = data;
                    // Le aviso a quien ingreso el mensaje que se mando
                    socket.emit('nuevo_mensaje',{status: 200, payload: { mensaje }});
                    // Le aviso a los demas
                    socket.broadcast.emit('nuevo_mensaje',{status: 200, payload: { mensaje }});
                    console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ${payload.id_usuario} mando un mensaje ID ${mensaje.id_mensaje}`);
            })
            .catch(err => {
                // Le aviso a al cliente que no se pudo mandar un mensaje
                socket.emit('nuevo_mensaje',{status: 400, payload: { error: "No se pudo Enviar Mensaje" }});
                console.error(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ${payload.id_usuario} intento mandar mensaje pero hubo un error`);
            })
    })
    // cuando se desconecta alguien
    socket.on('disconnect', function(){
        if (socket.id_usuario) {
            // Hago el pedido al servidor de Usuarios que desconecte al socket que se fue
            fetch(`${user_url}?id=${socket.id_usuario}&status=-1`,{ method: 'PATCH'})
                .then( response => {
                    // aviso a los clientes que refresquen su listado de usuarios
                    socket.broadcast.emit('desconecto_usuario',{status: 200, payload: {id_usuario: socket.id_usuario}});
                    console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ID ${socket.id_usuario} se desconecto`);
                }).catch(err => {
                    // aviso a los clientes que refresquen su listado de usuarios
                    // Aunque en la Base de datos va a quedar conectado
                    socket.broadcast.emit('desconecto_usuario',{status: 200, payload: {id_usuario: socket.id_usuario}});
                    console.error(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ${socket.id_usuario} intento desconectarse pero hubo un error`);
                })
        }

      });
  });

  
