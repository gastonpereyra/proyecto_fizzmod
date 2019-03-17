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
                        connection.query('SELECT `id_status` FROM `status_usuarios` WHERE `id_status` = 0;', (error, results) => {
                            if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                            // Si no existe lo creo
                            else if (results.length < 1) {
                                connection.query('INSERT INTO `status_usuarios` VALUES (0, "DESCONECTADO");', (error) => {
                                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                                    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | STATUS ID 0 Inicializado *`)
                                });
                            }
                        });
                        // Estad conectado - 1
                        connection.query('SELECT `id_status` FROM `status_usuarios` WHERE `id_status` = 1;', (error, results) => {
                            if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                            // Si no existe lo creo
                            else if (results.length < 1) {
                                connection.query('INSERT INTO `status_usuarios` VALUES (1, "CONECTADO");', (error) => {
                                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                                    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | STATUS ID 1 Incializado *`)
                                });
                            }
                        });
                    }
                })
                // Tabla de Usuarios
                connection.query('CREATE TABLE IF NOT EXISTS `usuarios` ( `id_usuario` TINYINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE, `nombre` VARCHAR(50) NOT NULL, `apellido` VARCHAR(50) NOT NULL, `email` VARCHAR(60) NOT NULL UNIQUE, `creado_en` DATETIME NOT NULL DEFAULT NOW(), `actualizo_en` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(), `id_status` TINYINT NOT NULL DEFAULT 1, PRIMARY KEY(id_usuario), FOREIGN KEY(id_status) REFERENCES `status_usuarios`(id_status));', (error) => {
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
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            // Busco en la base de datos, devuelvo la descripción del codigo de status
            connection.query('SELECT u.`id_usuario`, u.`nombre_usuario`, u.`nombre`, u.`apellido`, u.`email`, u.`creado_en`, u.`actualizo_en`, s.`descripcion` AS "status" FROM `usuarios` u JOIN `status_usuarios` s ON s.id_status = u.id_status;', 
                (error, results, fields) => {
                    const fecha = getFecha();
                    // si hay error imprimo en la consola el error y lo elevo
                    if (error) {
                        console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Todos - ${error.message}`);
                        err(`${error.message}`);
                    }
                    // Si no hay error imprimo en consola mensaje OK y devuelvo los resultados
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS USUARIOS - OK`);
                        res({ usuarios: results});
                    }
                });
        })
    },
    // TODOS los que tenga Status determinado, por default = Conectado
    buscarPorStatus: function(connection, status="CONECTADO") {
        // Busco el codigo del status que ingresa
        const status_code = status.toUpperCase() === "CONECTADO" || parseInt(status) === 1 ? 1 :
                            status.toUpperCase() === "DESCONECTADO" || parseInt(status) === 0 ? 0 :
                            null;

        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            // si existe el codigo de status
            if (status_code || status_code === 0) {
                // Busco en la base de datos
                connection.query('SELECT u.`id_usuario`, u.`nombre_usuario`, u.`nombre`, u.`apellido`, u.`email`, u.`creado_en`, u.`actualizo_en`, s.`descripcion` AS "status" FROM `usuarios` u JOIN `status_usuarios` s ON s.id_status = u.id_status WHERE s.`id_status` = ?;', [status_code],
                    (error, results) => {
                        // si hay error, imprime mensaje en la consola y elevo el error
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Todos los Usuarios de status ${status} - ${error.message}`);
                            err(`${error.message}`);
                        }
                        // Si no hay error, imprime mensaje OK en la consola y devuelve los resultados
                        else {
                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS USUARIOS DE STATUS ${status} - OK`);
                            res({ usuarios: results});
                        }
                });
            // Si codigo de status es incorrecto, elevo un error
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Todos los Usuarios de status ${status} - No existe status`);
                err(`No existe estado ${status} para Buscar`)
            }
        })
    },
    // UNO por ID
    buscarPorId: function(connection, id=0) {
        //paso el ID a numero
        const id_usuario = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            // si ingreso un ID valido 
            if (id_usuario > 0) {
                // Busco en la base de datos
                connection.query('SELECT u.`id_usuario`, u.`nombre_usuario`, u.`nombre`, u.`apellido`, u.`email`, u.`creado_en`, u.`actualizo_en`, s.`descripcion` AS "status" FROM `usuarios` u JOIN `status_usuarios` s ON s.id_status = u.id_status WHERE u.`id_usuario` = ?;', [id_usuario],
                 (error, results) => {
                     // si hay error, imprime mensaje en la consola y elevo el error
                     if (error) {
                         console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Usuario de ID ${id} - ${error.message}`);
                         err(`${error.message}`);
                     }
                     // Si no hay error, imprime mensaje OK en la consola y devuelve los resultados
                     else {
                         console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | BUSCAR USUARIOS DE ID ${id} - OK`);
                         res({ usuario: results[0]});
                     }
                });
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Usuario de ID ${id} - No es Valido`);
                err(`No es valido ID = ${id} para Buscar`)
            }
        })
        
    },
    // CREA un usuario
    crear: function(connection, data) {        
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            if (data && data.nombre_usuario && data.nombre && data.apellido && data.email) {
                connection.query('INSERT INTO `usuarios` (`nombre_usuario`, `nombre`, `apellido`, `email`) VALUES (?, ?, ?, ?);', 
                    [data.nombre_usuario, data.nombre, data.apellido, data.email], (error,results,fields) => {
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error en Crear Usuario - ${error.message}`);
                            err(`${error.message}`);
                        } else  {
                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Crear Usuario ID ${results.insertId} - OK`);
                            data.id = results.insertId;
                            res({usuario: data});
                        }
                    });
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error en Crear Usuario - Input incumpleto`);
                err(`Input incumpleto`);
            }
        })
    },
    // ACTUALIZA el usuario con ID
    actualizar: function(connection, id, data) {
        //paso el ID a numero
        const id_usuario = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            if (id_usuario > 0) {
                // Busco si existe el User
                connection.query('SELECT `id_usuario`, `nombre_usuario`, `nombre`, `apellido`, `email` FROM `usuarios` WHERE `id_usuario` = ?', 
                    [id_usuario], (error,results) => {
                        // Si hay un error
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Buscar Usuario - ${error.message}`);
                            err(`${error.message}`);
                        } else  {
                            // Si existe
                            if (results[0]) {
                                // Si existe la data a cambiar
                                if (data && (data.nombre || data.apellido || data.email)) {
                                  connection.query('UPDATE `usuarios` SET `nombre` = ? , `apellido` = ? , `email` = ? WHERE `id_usuario` = ?', 
                                    // Cambio el status por el contrario
                                    [data.nombre ? data.nombre : results[0].nombre, data.apellido ? data.apellido : results[0].apellido, data.email ? data.email : results[0].email, id_usuario], 
                                    (error,results_2) => {
                                        // Si hay error
                                        if (error) {
                                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Actualizar Usuario - ${error.message}`);
                                            err(`${error.message}`);
                                        } else if (results_2.affectedRows > 0) { // Si hizo cambios
                                            // Formo el objeto a devolver
                                            const usuario = {
                                                id_usuario, 
                                                nombre_usuario: results[0].nombre_usuario,
                                                nombre: data.nombre ? data.nombre : results[0].nombre,
                                                apellido: data.apellido ? data.apellido : results[0].apellido,
                                                email: data.email ? data.email : results[0].email
                                            };
                                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Actualizar Usuario ID ${id} por ${data.status} - OK`);
                                            res({usuario});
                                            
                                        } else { // Si no hubo cambios
                                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Actualizar Usuario de ID ${id} - No hubo cambios`);
                                            err(`No hubo cambios en el Usuario con ID ${id}`)
                                        }
                                    });
                                } else {
                                    console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Actualizar Usuario ID ${id} - Input incumpleto`);
                                    err(`Input incumpleto`);
                                }
                            // Si no existe
                            } else {
                                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Usuario de ID ${id} - No existe Usuario`);
                                err(`No es existe Usuario con ID ${id}`)
                            }
                            
                        }
                    });
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Usuario de ID ${id} - No es Valido`);
                err(`No es valido ID = ${id} para Buscar`)
            }
        })
    },
    // Cambia el estado de un usuario
    cambiarStatus: function(connection, id) {
        //paso el ID a numero
        const id_usuario = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            if (id_usuario > 0) {
                // Busco si existe el User
                connection.query('SELECT `id_usuario`, `id_status` FROM `usuarios` WHERE `id_usuario` = ?', 
                    [id_usuario], (error,results) => {
                        // Si hay un error
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Buscar Usuario - ${error.message}`);
                            err(`${error.message}`);
                        } else  {
                            // Si existe
                            if (results[0]) {
                                connection.query('UPDATE `usuarios` SET `id_status` = ? WHERE `id_usuario` = ?', 
                                    // Cambio el status por el contrario
                                    [results[0].id_status === 1 ? 0 : 1, id_usuario], (error,results_2) => {
                                        // Si hay error
                                        if (error) {
                                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Cambiar Status de Usuario - ${error.message}`);
                                            err(`${error.message}`);
                                        } else if (results_2.affectedRows > 0) { // si hubo cambios
                                            // Formo el objeto a devolver
                                            const usuario = {id_usuario, status: results[0].id_status === 1 ? "DESCONECTADO" : "CONECTADO"}
                                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Cambiar Status de Usuario ID ${id} por ${usuario.status} - OK`);
                                            res({usuario});
                                        } else { // Si no hubo cambios
                                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Usuario de ID ${id} - No hubo cambios`);
                                            err(`No hubo cambios en el  Usuario con ID ${id}`)
                                        }
                                    });
                            // Si no existe
                            } else {
                                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Usuario de ID ${id} - No existe Usuario`);
                                err(`No es existe Usuario con ID ${id}`)
                            }
                        }
                    });
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Usuario de ID ${id} - No es Valido`);
                err(`No es valido ID = ${id} para Buscar`)
            }
        })
    }
}