const url = require('url');
const router_usuario = require('./router_usuario');
const router_mensaje = require('./router_mensaje');

module.exports = async (req,res) => {
    const {pathname} = url.parse(req.url,true);
    let response = { error: null, data: null};
    switch(pathname) {
        case '/usuario':
            router_usuario(req,res);
            break;
        case '/mensaje':
            router_mensaje(req,res)
            break;
        case '/':
            response.data= "index.html";
            res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
            res.end(JSON.stringify(response));
            break;
        case '/registro':
            response.data= "registro.html";
            res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
            res.end(JSON.stringify(response));
            break;
    }

}