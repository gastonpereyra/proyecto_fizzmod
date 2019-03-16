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
                connection.query('CREATE TABLE IF NOT EXISTS `usuarios` ( `id_usuario` TINYINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE, `nombre` VARCHAR(50) NOT NULL, `apellido` VARCHAR(50) NOT NULL, `email` VARCHAR(60) NOT NULL UNIQUE, `creado_en` DATETIME NOT NULL,`actualizo_en` DATETIME NOT NULL, `id_status` TINYINT NOT NULL DEFAULT 0, PRIMARY KEY(id_usuario), FOREIGN KEY(id_status) REFERENCES `status_usuarios`(id_status));', (error, results, fields) => {
                    fecha = getFecha();
                    if (error) console.error(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Error Tabla Usuaruios - ${error.message}`);
                    else {
                        console.log(`* Base de Datos | ${fecha.dia} | ${fecha.hora} | Tabla Usuarios Lista! *`)
                    }
                })
            }
        })
    }
}