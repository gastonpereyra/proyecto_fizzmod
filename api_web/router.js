const url = require('url');
const fs = require('fs');
const router_usuario = require('./router_usuario');
const router_mensaje = require('./router_mensaje');

module.exports = async (req,res) => {
    const {pathname} = url.parse(req.url,true);
    
    // let response = { error: null, data: null};
    switch(pathname) {
        case '/usuario':
            router_usuario(req,res);
            break;
        case '/mensaje':
            router_mensaje(req,res)
            break;
        case '/':
            res.writeHeader(200, "OK", {"Content-Type":"text/html"} );
            fs.createReadStream(`${__dirname}/public/index.html`).pipe(res);
            break;
        /*
        case '/aindex':
            res.writeHeader(200, "OK", {"Content-Type":"text/html"} );
            fs.createReadStream(`${__dirname}/public/index.html`).pipe(res);
            break;
        case '/registro':
            res.writeHeader(200, "OK", {"Content-Type":"text/html"} );
            fs.createReadStream(`${__dirname}/public/registro.html`).pipe(res);
            break;
        */
        default:
            const paths = pathname.split('.');
            let path = "/";
            if (paths.length>1) {
                if (paths[paths.length-1] === 'js') 
                    path= `/src${pathname}`;
                else 
                    path= `/public${pathname}`;
            } else
                path= `/public${pathname}.html`;
            const pagina = fs.createReadStream(`${__dirname}${path}`);
            res.writeHeader(200, "OK", {"Content-Type":"text/html"} );
            pagina.on('error', (err) => {
                console.log(err);
                res.end("a");
            });
            pagina.pipe(res);
            
    }

}