const Notificacion = {
    props: ['isActive','cerrar','message', 'hayError'],
    template: `
    <div class="modal" :class="{'is-active':isActive}">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="notification content has-text-centered" :class="{'is-danger':hayError, 'is-primary':!hayError}">
          <button class="delete" @click="cerrar"></button>
          <span class="is-size-3">{{ hayError ? "Ups.. Hubo un Error" : "Bienvenido!!" }}</span>
          <p class="is-size-5">{{message}}</p>
          <span class="buttons is-centered">
              <a href="/registro" class="button is-light is-large">{{ hayError ? "Ir a Registrarse" : "Cambiar Perfil"}}</a>
              <button @click="cerrar" class="button is-warning is-large">Quedarse</button>
          </span>
        </div>
      </div>
    </div>
    `
};

const MenuUsuarios = {
    props: ['usuarios_conectados','usuarios_desconectados','cargarUsuarios'],
    template: `
    <aside class="menu box">
        <a class="menu-label" @click="cargarUsuarios">Usuarios</a>
        <p class="menu-label">Conectados</p>
        <ul class="menu-list" >
            <li v-for="usuario in usuarios_conectados">
                <a class="has-text-success"> 
                    <span class="icon">
                        <i class="fas fa-user-check"></i>
                    </span>
                    {{usuario.nombre_usuario}}
                </a>
            </li>
        </ul>
        <p class="menu-label">Desconectados</p>
        <ul class="menu-list">
            <li v-for="usuario in usuarios_desconectados">
                <a class="has-text-danger"> 
                    <span class="icon">
                        <i class="fas fa-user-times"></i>
                    </span>
                    {{usuario.nombre_usuario}}
                </a>
            </li>
        </ul>
    </aside>
    `
};

const VerMensajes = {
    props: ['mensajes','id_usuario','usuarios'],
    methods: {
        mensaje_nombre : function(id) {
            return this.usuarios ? this.usuarios.find( u => u.id_usuario === id).nombre_usuario : "Anonimo";  
        }
    },
    template: `
        <ul>
            <li v-for="mensaje in mensajes">
                <article class="message" :class="{'is-primary':id_usuario == mensaje.id_usuario, 'is-warning': id_usuario != mensaje.id_usuario}">
                    <div class="message-header">
                    <p>{{mensaje_nombre(mensaje.id_usuario)}}</p>
                    </div>
                    <div class="message-body">
                    {{mensaje.cuerpo}}
                    </div>
                </article>
            </li>
        </ul>
    `
};

const InputMensaje = {
    props: ['id_usuario','cargarMensajes','socket'],
    data: function() {
        return ({
            cuerpo: "",
            url_mensaje : 'http://localhost:8000/mensaje'
        })
    },
    methods: {
        ingresarMensaje: async function () {

            this.socket.emit('manda_mensaje',{status:200, payload: {id_usuario: this.id_usuario, cuerpo: this.cuerpo}});
            this.cuerpo= "";
        }
    },
    template: `
    <article class="media">
        <figure class="media-left">
            <p class="image is-64x64">
            <img class="is-rounded" src="images/Fizzmod-logo.png">
            </p>
        </figure>
        <div class="media-content">
            <div class="field">
                <p class="control">
                    <textarea class="textarea is-medium" placeholder="Ingrese el Mensaje" v-model="cuerpo"></textarea>
                </p>
            </div>
            <nav class="level">
                <div class="level-left">
                    <div class="level-item">
                        <button class="button is-primary" @click="ingresarMensaje">Mandar</button>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <button class="button is-warning" @click="cargarMensajes">Cargar Mensajes</button>
                    </div>
                </div>
            </nav>
        </div>
    </article>
    `
}

const SignInCard= new Vue({
    el: "#chatBox",
    components : {
        Notificacion,
        MenuUsuarios,
        VerMensajes,
        InputMensaje
    },
    data: {
      url: 'http://localhost:8000/',
      url_usuario : 'http://localhost:8000/usuario',
      url_mensaje : 'http://localhost:8000/mensaje',
      cardImage: "https://cdn.glitch.com/a519acdb-09ec-474c-8f97-89d4340a2a8d%2FdesafioFizzmod.jpg?1552268149070",
      socket: null,
      dia: '2019-01-01',
      hora: '00:00:00',
      id_usuario: null,
      usuario: {},
      usuarios: [],
      mensajes: [],
      notificacion_activa: false,
      isError: false,
      notificacion_mensaje: ""
    },
    methods: {
      estaRegistrado: async function () {
        let id = localStorage.getItem('id_usuario');
        if (id) {
            const response = await fetch(`${this.url_usuario}?id=${id}`)
            const {error, data} = await response.json();
            if (error){
                console.error(error);
                this.id_usuario= null;
                this.usuario= {};
                id= null;
                localStorage.removeItem('id_usuario');
                localStorage.removeItem('usuario');
                this.activarNotificacion(`Problema con el usuario registrado: ${error}.`,true);
            } else {
                this.id_usuario = data.usuario.id_usuario;
                this.usuario = data.usuario;
                this.activarNotificacion(`${this.usuario.nombre} ${this.usuario.apellido} ha ingresado como ${this.usuario.nombre_usuario}`);
            }
        }
        return id;
      },
      cargarUsuarios: async function() {
        const raw = await fetch(`${this.url_usuario}`);
        const {error, data} = await raw.json();
        if (error) {
            console.error(error);
            this.activarNotificacion(`Error al cagar los usuarios: ${error}`,true);
        } else {
            this.usuarios = data.usuarios;
        }
      },
      cargarMensajes: async function() {
        const raw = await fetch(`${this.url_mensaje}`);
        const {error, data} = await raw.json();
        if (error) {
            console.error(error);
            this.activarNotificacion(`Error al cagar los mensajes: ${error}`,true);
        } else {
            this.mensajes = data.mensajes;
        }
      },
      activarNotificacion: function (mensaje='',hayError=false) {
        this.isError= hayError;
        this.notificacion_mensaje= mensaje;
        this.notificacion_activa = !this.notificacion_activa;

      }
    },
    created () {
        // Cuando cierra la pestaña o ventana que el usuario pase a desconectado
        this.socket= io(this.url);

        this.socket.on('nuevo_mensaje', ({status, payload}) => {
            if (status === 200) {
                this.mensajes.push(payload.mensaje);
                // this.cargarMensajes();
            }
        })

        this.socket.on('nuevo_usuario', ({status, payload}) => {
            if (status === 200) {
                const usuario = this.usuarios.find( u => u.id_usuario == payload.id_usuario);
                if (usuario)
                    usuario.status = "CONECTADO"
            }
        })

        this.socket.on('conecto_usuario', ({status, payload}) => {
            if (status === 200) {
                this.usuarios = payload.usuarios;
            }
        })

        this.socket.on('desconecto_usuario', ({status, payload}) => {
            if (status === 200) {
                const usuario = this.usuarios.find( usuario => usuario.id_usuario == payload.id_usuario)
                if (usuario)
                    usuario.status = "DESCONECTADO"
            }
        })
    },
    mounted: function () {

        this.dia = new Date().toISOString().split('T')[0];
        this.hora = new Date().toISOString().split('T')[1].split('.')[0];
        this.estaRegistrado().then( id => {
            if (id) {
                this.socket.emit('entra_usuario',{status:200, payload: {id_usuario: id}});
            }
        })

        
    },
    computed: {
        
    },
    template : `
      <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent is-9">
            <div class="tile is-child box">
                <VerMensajes :mensajes="mensajes" :id_usuario="id_usuario" :usuarios="usuarios"/>
            </div>
            <div class="tile is-child box">
                <InputMensaje :id_usuario="id_usuario" :cargarMensajes="cargarMensajes" :socket="socket" />
            </div>
        </div>
        <div class="tile is-3">
            <MenuUsuarios :usuarios_conectados="usuarios.filter(u => u.status === 'CONECTADO')" 
                          :usuarios_desconectados="usuarios.filter(u => u.status === 'DESCONECTADO')" 
                          :cargarUsuarios="cargarUsuarios" />
        </div>
      <Notificacion :isActive="notificacion_activa" :message="notificacion_mensaje" :hayError="isError" :cerrar="activarNotificacion"/>
      </div>
    `
  });