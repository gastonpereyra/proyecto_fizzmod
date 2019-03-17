const {getFecha} = require('../opciones');

module.exports = {
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
                // Tabla de Status de Mensajes
                connection.query('CREATE TABLE IF NOT EXISTS `status_mensajes` ( `id_status` TINYINT NOT NULL UNIQUE, `descripcion` VARCHAR(8) NOT NULL, PRIMARY KEY(id_status));', (error) => {
                    fecha = getFecha();
                    // Si hay Error -> Log
                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Tabla Status_Mensajes - ${error.message}`);
                    // Si existia o la crea
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Tabla Status_Mensajes Lista! *`);
                        // Intento buscar si existen los Status
                        // Estado No Leido - 0
                        connection.query('SELECT `id_status` FROM `status_mensajes` WHERE `id_status` = 0;', (error, results) => {
                            if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                            // Si no existe lo creo
                            else if (results.length < 1) {
                                connection.query('INSERT INTO `status_mensajes` VALUES (0, "NO LEIDO");', (error) => {
                                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                                    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | STATUS ID 0 Inicializado *`)
                                });
                            }
                        });
                        // Estad Leido - 1
                        connection.query('SELECT `id_status` FROM `status_mensajes` WHERE `id_status` = 1;', (error, results) => {
                            if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                            // Si no existe lo creo
                            else if (results.length < 1) {
                                connection.query('INSERT INTO `status_mensajes` VALUES (1, "LEIDO");', (error) => {
                                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error - ${error.message}`);
                                    else console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | STATUS ID 1 Incializado *`)
                                });
                            }
                        });
                    }
                })
                // Tabla de Mensajes
                connection.query('CREATE TABLE IF NOT EXISTS `mensajes` ( `id_mensaje` MEDIUMINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `cuerpo` TEXT NOT NULL, `creado_en` DATETIME NOT NULL DEFAULT NOW(),`actualizo_en` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(), `id_usuario` TINYINT UNSIGNED NOT NULL, `id_status` TINYINT NOT NULL DEFAULT 0, PRIMARY KEY(id_mensaje), FOREIGN KEY(id_status) REFERENCES `status_mensajes`(id_status), FOREIGN KEY(id_usuario) REFERENCES `usuarios`(id_usuario));', (error) => {
                    fecha = getFecha();
                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Tabla Mensajes - ${error.message}`);
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Tabla Mensajes Lista! *`)
                    }
                })
            }
        })
    },
    // BUSQUEDA de Mensajes
    // TODOS
    buscarTodos: function(connection) {
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            // Busco en la base de datos, devuelvo la descripción del codigo de status
            connection.query('SELECT `id_mensaje`, m.`cuerpo`, m.`id_usuario`, m.`creado_en`, m.`actualizo_en`, s.`descripcion` AS "status" FROM `mensajes` m JOIN `status_mensajes` s ON s.id_status = m.id_status;',
                (error, results) => {
                    const fecha = getFecha();
                    // si hay error imprimo en la consola el error y lo elevo
                    if (error) {
                        console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Todos - ${error.message}`);
                        err(`${error.message}`);
                    }
                    // Si no hay error imprimo en consola mensaje OK y devuelvo los resultados
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS MENSAJES - OK`);
                        res({ usuarios: results});
                    }
                });
        })
    },
    // TODOS los que Mensajes desde una fecha
    buscarDesde: function(connection, dia="2019-01-01", hora="00:00:00") {
        // armo el DATETIME
        const fecha_desde = `${dia} ${hora}`;

        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            if ((new Date(fecha_desde)) == 'Invalid Date') {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Todos los Mensajes ${dia} ${hora} - Fecha Invalida`);
                err('Fecha Invalida')
            } else {
                // Busco en la base de datos
                connection.query('SELECT m.`id_mensaje`, m.`cuerpo`, m.`id_usuario`, m.`creado_en`, m.`actualizo_en`, s.`descripcion` AS "status" FROM `mensajes` m JOIN `status_mensajes` s ON s.id_status = m.id_status WHERE m.`creado_en` > ?;', [fecha_desde],
                    (error, results) => {
                        // si hay error, imprime mensaje en la consola y elevo el error
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Todos los Mensajes desde status ${dia} ${hora} - ${error.message}`);
                            err(`${error.message}`);
                        }
                        // Si no hay error, imprime mensaje OK en la consola y devuelve los resultados
                        else {
                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS USUARIOS DESDE ${dia} ${hora}} - OK`);
                            res({ usuarios: results});
                        }
                });
            } 
        })
    },
    // UNO por ID
    buscarPorId: function(connection, id=0) {
        //paso el ID a numero
        const id_mensaje = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            // si ingreso un ID valido 
            if (id_mensaje > 0) {
                // Busco en la base de datos
                connection.query('SELECT m.`id_mensaje`, m.`cuerpo`, m.`id_usuario`, m.`creado_en`, m.`actualizo_en`, s.`descripcion` AS "status" FROM `mensajes` m JOIN `status_mensajes` s ON s.id_status = m.id_status WHERE m.`id_mensaje` = ?;', [id_mensaje],
                 (error, results) => {
                     // si hay error, imprime mensaje en la consola y elevo el error
                     if (error) {
                         console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Mensaje de ID ${id} - ${error.message}`);
                         err(`${error.message}`);
                     }
                     // Si no hay error, imprime mensaje OK en la consola y devuelve los resultados
                     else {
                         console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | BUSCAR MENSAJE DE ID ${id} - OK`);
                         res({ usuario: results[0]});
                     }
                });
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Buscar Mensaje de ID ${id} - No es Valido`);
                err(`No es valido ID = ${id} para Buscar`)
            }
        })
        
    },
    // CREA un Mensaje
    crear: function(connection, data) {        
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            if (data && data.id_usuario && data.cuerpo) {
                connection.query('INSERT INTO `mensajes` (`cuerpo`, `id_usuario`) VALUES (?, ?);', 
                    [data.cuerpo, data.id_usuario], (error,results) => {
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error en Crear Mesnaje - ${error.message}`);
                            err(`${error.message}`);
                        } else  {
                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Crear Mensaje ID ${results.insertId} - OK`);
                            data.id = results.insertId;
                            res({mensaje: data});
                        }
                    });
            } else {
                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error en Crear Mensaje - Input incumpleto`);
                err(`Input incumpleto`);
            }
        })
    },
    // Cambia el estado de un Mensaje
    cambiarStatus: function(connection, id) {
        //paso el ID a numero
        const id_mensaje = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!connection) err("No esta Conectado a una Base de Datos");
            const fecha = getFecha();
            if (id_mensaje > 0) {
                // Busco si existe el User
                connection.query('SELECT `id_mensaje`, `id_status` FROM `mensajes` WHERE `id_mensaje` = ?', 
                    [id_mensaje], (error,results) => {
                        // Si hay un error
                        if (error) {
                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Buscar Mensaje - ${error.message}`);
                            err(`${error.message}`);
                        } else  {
                            // Si existe
                            if (results[0]) {
                                connection.query('UPDATE `mensajes` SET `id_status` = ? WHERE `id_mensaje` = ?', 
                                    // Cambio el status por el contrario
                                    [results[0].id_status === 1 ? 0 : 1, id_mensaje], (error,results_2) => {
                                        // Si hay error
                                        if (error) {
                                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error al Cambiar Status de Mensaje - ${error.message}`);
                                            err(`${error.message}`);
                                        } else if (results_2.affectedRows > 0) { // si hubo cambios
                                            // Formo el objeto a devolver
                                            const mensaje = {id_mensaje, status: results[0].id_status === 1 ? "NO LEIDO" : "LEIDO"}
                                            console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Cambiar Status de Mensaje ID ${id} por ${mensaje.status} - OK`);
                                            res({mensaje});
                                        } else { // Si no hubo cambios
                                            console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Mensaje de ID ${id} - No hubo cambios`);
                                            err(`No hubo cambios en el Mensaje con ID ${id}`)
                                        }
                                    });
                            // Si no existe
                            } else {
                                console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Cambiar de Estado al Mensaje de ID ${id} - No existe Mensaje`);
                                err(`No es existe Mensaje con ID ${id}`)
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