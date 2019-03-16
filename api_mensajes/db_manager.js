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
                connection.query('CREATE TABLE IF NOT EXISTS `mensajes` ( `id_mensaje` MEDIUMINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `cuerpo` TEXT NOT NULL, `creado_en` DATETIME NOT NULL,`actualizo_en` DATETIME NOT NULL, `id_usuario` TINYINT UNSIGNED NOT NULL, `id_status` TINYINT NOT NULL DEFAULT 0, PRIMARY KEY(id_mensaje), FOREIGN KEY(id_status) REFERENCES `status_mensajes`(id_status), FOREIGN KEY(id_usuario) REFERENCES `usuarios`(id_usuario));', (error) => {
                    fecha = getFecha();
                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Tabla Mensajes - ${error.message}`);
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Tabla Mensajes Lista! *`)
                    }
                })
            }
        })
    }
}