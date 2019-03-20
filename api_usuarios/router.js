const url = require('url');
const db = require('./db_manager');

const body_parser = (req) => {
    return new Promise(function(res,err) {
        let buffer = [];
        req.on('data', data => {
            buffer.push(data);
        })
        req.on('end', () => {
            
            if (req.headers['content-type']==='application/json' && buffer.length) {
                
                res(JSON.parse(Buffer.concat(buffer)));
                buffer = [];
            } else {
                err("Formato Erroneo o Vacio");
            }
        })
    });
};

module.exports = async (connection,req,res) => {
    const {pathname, query} = url.parse(req.url,true);
    const {method} = req;
    let response = { error: null, data: null};
    if (pathname !== '/') response.error = `Error No existe endpoint`;
    else {
        switch(method) {
            case 'GET':
                if (query.id) {
                    try {
                        response.data = await db.buscarPorId(connection,query.id);
                    } catch (err) {
                        response.error = `Error al buscar Usuario de ID ${query.id} : ${err}`;
                    }
                } else if (Object.keys(query).length === 0) {
                    try {
                        response.data = await db.buscarTodos(connection);
                    } catch (err) {
                        response.error = `Error al buscar Usuarios : ${err}`;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            case 'POST':
                if (query.id && query.status) {
                    try {
                        response.data = await db.cambiarStatus(connection,query.id,query.status);
                    } catch (err) {
                        response.error = `Error al cambiar de estado de Usuario de ID ${query.id} : ${err}`;
                    }
                } else if (Object.keys(query).length === 0) {
                    try {
                        const nuevo_usuario = await body_parser(req);
                        response.data = await db.crear(connection,nuevo_usuario);
                    } catch (err) {
                        response.error = `Error al crear Usuario : ${err}`;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            case 'PUT':
            case 'PATCH':
                if (query.id) {
                    try {
                        const nuevo_usuario = await body_parser(req);
                        response.data = await db.actualizar(connection,query.id,nuevo_usuario);
                    } catch (err) {
                        response.error = `Error al actualizar Usuario de ID ${query.id} : ${err}`;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            default:
                response.error = `Error No existe endpoint`;
        }
    }
    res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
    res.end(JSON.stringify(response));
}