const {getFecha} = require('../opciones');

module.exports = {
    // Conectar e Inicializar la Base de Datos
    conectar : function (connection) {
        // Hago un query de prueba para ver si se conecto
        connection.query('SELECT 1', function (error) {
            let fecha = getFecha();
            // si se produce un error
            if (error) 
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${err.message}`);
            // si se conecto
            else {
                console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Conectada *`);
                // Inicializo las tablas si no existen
                // Tabla de Status de Usuarios
                connection.query('CREATE TABLE IF NOT EXISTS `status_usuarios` ( `id_status` TINYINT NOT NULL UNIQUE, `descripcion` VARCHAR(12) NOT NULL, PRIMARY KEY(id_status));', (error, results, fields) => {
                    fecha = getFecha();
                    // Si hay Error -> Log
                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Tabla Status_Usuaruios - ${error.message}`);
                    // Si existia o la crea
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Tabla Status_Usuarios Lista! *`);
                        // Intento buscar si existen los Status
                        // Estado desconetado - 0
                        connection.query('SELECT `id_status` FROM `status_usuarios` WHERE `id_status` = 0;', (error, results, fields) => {
                            if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                            // Si no existe lo creo
                            else if (results.length < 1) {
                                connection.query('INSERT INTO `status_usuarios` VALUES (0, "DESCONECTADO");', (error, results, fields) => {
                                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                                    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | STATUS ID 0 Inicializado *`)
                                });
                            }
                        });
                        // Estad conectado - 1
                        connection.query('SELECT `id_status` FROM `status_usuarios` WHERE `id_status` = 1;', (error, results, fields) => {
                            if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                            // Si no existe lo creo
                            else if (results.length < 1) {
                                connection.query('INSERT INTO `status_usuarios` VALUES (1, "CONECTADO");', (error, results, fields) => {
                                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                                    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | STATUS ID 1 Incializado *`)
                                });
                            }
                        });
                    }
                })
                // Tabla de Usuarios
                connection.query('CREATE TABLE IF NOT EXISTS `usuarios` ( `id_usuario` TINYINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE, `nombre` VARCHAR(50) NOT NULL, `apellido` VARCHAR(50) NOT NULL, `email` VARCHAR(60) NOT NULL UNIQUE, `creado_en` DATETIME NOT NULL DEFAULT NOW(), `actualizo_en` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(), `id_status` TINYINT NOT NULL DEFAULT 0, PRIMARY KEY(id_usuario), FOREIGN KEY(id_status) REFERENCES `status_usuarios`(id_status));', (error, results, fields) => {
                    fecha = getFecha();
                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Tabla Usuaruios - ${error.message}`);
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Tabla Usuarios Lista! *`)
                    }
                })
            }
        })
    },
    // BUSQUEDA de usuario
    // TODOS
    buscarTodos: function(connection) {
        return new Promise((res,err) => {
            console.log('BUSCAR TODOS');
            res({ usuarios: 'BUSCAR TODOS'.split('')});
        })
    },
    // TODOS los que tenga Status determinado
    buscarPorStatus: function(connection, status) {
        return new Promise((res,err) => {
            if (status) {
                console.log(`BUSCAR ${status}`);
                res({ usuarios: 'BUSCAR TODOS'.split('')});
            } else err("ERROR")
        })
    },
    // UNO por ID
    buscarPorId: function(connection, id) {
        return new Promise((res,err) => {
            if (id) {
                console.log(`BUSCAR ${id}`);
                res({ usuario: {id}});
            } else err("ERROR")
        })
        
    },
    // CREA un usuario
    crear: function(connection, data) {
        return new Promise((res,err) => {
            console.log('CREA UN USUARIO');
            res({usuario: "CReado"});
        })
    },
    // ACTUALIZA el usuario con ID
    actualizar: function(connection, id, data) {
        return new Promise((res,err) => {
            if (id) {
                console.log(`ACTUALIZA USUARIO ${id}`);
                res({ usuario: {id}});
            } else err("ERROR")
        })
    },
    // Cambia el estado de un usuario
    cambiarStatus: function(connection, id) {
        return new Promise((res,err) => {
            if (id) {
                console.log(`USUARIO ${id} CAMBIA DE ESTADO`);
                res({ usuario: {id}});
            } else err("ERROR")
        })
        
    }
}