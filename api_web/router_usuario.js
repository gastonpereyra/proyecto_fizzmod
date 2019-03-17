const url = require('url');
const fetch = require('node-fetch');

const user_url = 'http://localhost:8080';

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

module.exports = async (req, res) => {
    const {query} = url.parse(req.url,true);
    const {method} = req;

    let response = { error: null, data: null};
    let info_raw;

        switch(method) {
            case 'GET':
                if (query.id) {

                    info_raw = await fetch(`${user_url}?id=${query.id}`);
                    response = await info_raw.json();

                } else if (Object.keys(query).length === 0) {

                    info_raw = await fetch(user_url);
                    response = await info_raw.json(); 

                } else response.error = `Error No existe endpoint`;
                break;
            case 'POST':
                if (query.id) {
                    
                    info_raw = await fetch(`${user_url}?id=${query.id}`,{ method: 'POST'});
                    response = await info_raw.json(); 

                } else if (Object.keys(query).length === 0) {
                    try {
                        const nuevo_usuario = await body_parser(req);
                        info_raw = await fetch(user_url,{ 
                            method: 'POST', 
                            body: JSON.stringify(nuevo_usuario), 
                            headers:{
                            'Content-Type': 'application/json'
                          }});
                        response = await info_raw.json(); 
                    } catch(err) {
                        response.error = err.message;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            case 'PUT':
            case 'PATCH':
                if (query.id) {
                    try {
                        const nuevo_usuario = await body_parser(req);
                        info_raw = await fetch(`${user_url}?id=${query.id}`,{ 
                            method: 'PUT', 
                            body: JSON.stringify(nuevo_usuario), 
                            headers:{
                            'Content-Type': 'application/json'
                          }});
                        response = await info_raw.json(); 
                    } catch (err) {
                        response.error = `Error al actualizar Usuario de ID ${query.id} : ${err}`;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            default:
                response.error = `Error No existe endpoint`;
        }

    res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
    res.end(JSON.stringify(response));
}