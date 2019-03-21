const url= 'http://localhost:8000';

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

// Lista de usuarios
const MenuUsuarios = {
    props: ['usuarios_conectados','usuarios_desconectados'],
    template: `
    <aside class="menu box">
        <a class="menu-label">Usuarios</a>
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

// Lista de Mensajes
const VerMensajes = {
    props: ['mensajes','id_usuario','usuarios'],
    methods: {
        // Para renderizar el username
        mensaje_nombre_usuario : function(id) {
            // Si estan cargados los usuarios
            if (this.usuarios) {
                // Busco el usuario por ID
                const usuario = this.usuarios.find( u => u.id_usuario === id);
                // Si existe imprime el Nombre de Usuario sino Anonimo
                return usuario ? usuario.nombre_usuario : "Anonimo";
            }
            return "Anonimo";  
        },
        // Para renderizar el nombre 
        mensaje_nombre : function(id) {
            // Si estan cargados los usuarios
            if (this.usuarios) {
                // Busco el usuario por ID
                const usuario = this.usuarios.find( u => u.id_usuario === id);
                // Si existe imprime el Nombre de Usuario sino Anonimo
                return usuario ? usuario.nombre : "-";
            }
            return "-";  
        },
        // Para renderizar el apellido
        mensaje_apellido : function(id) {
            // Si estan cargados los usuarios
            if (this.usuarios) {
                // Busco el usuario por ID
                const usuario = this.usuarios.find( u => u.id_usuario === id);
                // Si existe imprime el Nombre de Usuario sino Anonimo
                return usuario ? usuario.apellido : "-";
            }
            return "-";  
        },
        // Para renderizar la fecha con el tiempo local
        mensaje_creado: function(fecha) {
            if (fecha) {
                return new Date(fecha).toLocaleDateString();
            }
            return "YYYY-MM-DD"
        }
    },
    computed: {
        mensajes_ordenados: function() {
            return this.mensajes.sort( (m1, m2) => m2.creado_en > m1.creado_en);
        }
    },
    template: `
        <ul>
            <!-- Itero sobre los mensajes -->
            <li v-for="mensaje in mensajes_ordenados">
                <!-- Mensaje -->
                <article class="message" :class="{'is-primary':id_usuario == mensaje.id_usuario, 'is-warning': id_usuario != mensaje.id_usuario}">
                    <!-- Titulo -->
                    <div class="message-header">
                        <p>
                            <!-- Nombre -->
                            <span class="tags has-addons">
                                <span class="tag is-dark">
                                    <span class="icon is-small">
                                        <i class="fas fa-user"></i>
                                    </span>
                                </span>
                                <span class="tag is-link">{{mensaje_nombre(mensaje.id_usuario)}}</span>
                                <span class="tag is-info">{{mensaje_apellido(mensaje.id_usuario)}}</span>
                            </span>
                        </p>
                        <p> 
                            <!-- Username -->
                            <span class="tags has-addons">
                                <span class="tag is-dark ">
                                    <span class="icon is-small">
                                        <i class="fas fa-at"></i>
                                    </span>
                                </span>
                                <span class="tag is-danger">{{mensaje_nombre_usuario(mensaje.id_usuario)}}</span>
                            </span>
                        </p>
                    </div>
                    <!-- Contenido -->
                    <div class="message-body">
                        <!-- Mensaje -->
                        <p class="content">{{mensaje.cuerpo}}</p>
                        <nav class="level">
                            <div class="level-left">
                                <!-- Fecha de creación - VISTO o NO VISTO -->
                                <div class="level-item">
                                    <span class="tags has-addons">
                                        <span class="tag is-dark ">
                                            <span class="icon is-small">
                                                <i class="fas fa-calendar"></i>
                                            </span>
                                        </span>
                                        <span class="tag is-warning">{{mensaje_creado(mensaje.creado_en)}}</span>
                                        <span class="tag is-info">{{mensaje.status}}</span>
                                    </span>
                                </div>
                            </div>
                        </nav>
                    </div>
                </article>
            </li>
        </ul>
    `
};

// Para ingresar el mensaje a enviar
const InputMensaje = {
    props: ['id_usuario','usuario','socket', "cargarMensajes"],
    data: function() {
        return ({
            cuerpo: ""
        })
    },
    methods: {
        // Mandar un Mensaje
        ingresarMensaje: function () {
            // Le envia al websocket el evento y la info necesario
            this.socket.emit('manda_mensaje',{status:200, payload: {id_usuario: this.id_usuario, cuerpo: this.cuerpo}});
            // Limpió el input
            this.cuerpo= "";
        }
    },
    template: `
    <article class="media">
        <!-- Imagen -->
        <figure class="media-left">
            <p class="image is-64x64">
            <img class="is-rounded" src="images/Fizzmod-logo.png">
            </p>
        </figure>
        <!-- Contenido -->
        <div class="media-content">
            <!-- Input para el mensaje -->
            <div class="field">
                <p class="control">
                    <textarea class="textarea is-medium" placeholder="Ingrese el Mensaje" v-model="cuerpo"></textarea>
                </p>
            </div>
            <!-- Barra inferior -->
            <nav class="level">
                <!-- Nombre y Apellido del Usuario -->
                <div class="level-left">
                    <div class="level-item">
                        <span class="tags has-addons">
                            <span class="tag is-dark is-medium">
                                <span class="icon is-small">
                                    <i class="fas fa-user-secret"></i>
                                </span>
                            </span>
                            <span class="tag is-primary is-medium">{{usuario.nombre}}</span>
                            <span class="tag is-info is-medium">{{usuario.apellido}}</span>
                        </span>
                    </div>
                    <!-- Username del Usuario -->
                    <div class="level-item">
                        <span class="tags has-addons">
                            <span class="tag is-dark is-medium">
                                <span class="icon is-small">
                                    <i class="fas fa-at"></i>
                                </span>
                            </span>
                            <span class="tag is-danger is-medium">{{usuario.nombre_usuario}}</span>
                        </span>
                    </div>
                </div>
                <div class="level-right">
                    <!-- Boton para Mandar el Mensaje -->
                    <div class="level-item">
                        <button class="button is-success" @click="ingresarMensaje" title="Enviar Mensaje">
                            <span class="icon is-small">
                                <i class="fas fa-paper-plane"></i>
                            </span>
                            <span>Enviar</span>
                        </button>
                    </div>
                    <!-- Boton para Cargar los mensajes anteriores -->
                    <div class="level-item">
                        <button class="button is-warning" @click="cargarMensajes" title="Cargar todos los mensajes Historicos">
                            <span class="icon is-small">
                                <i class="fas fa-sync"></i>
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    </article>
    `
}

// Componente Principal
const SignInCard= new Vue({
    el: "#chatBox",
    components : {
        Notificacion,
        MenuUsuarios,
        VerMensajes,
        InputMensaje
    },
    data: {
      socket: null,
      id_usuario: null,
      usuario: {},
      usuarios: [],
      mensajes: [],
      notificacion_activa: false,
      isError: false,
      notificacion_mensaje: ""
    },
    methods: {
       // Para chequear que el usuario guardado exista en la base de datos
      estaRegistrado: async function () {
        let id = localStorage.getItem('id_usuario');
        if (id) {
            const response = await fetch(`${url}/usuario?id=${id}`)
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
      // Cargar Todos los mensajes
      cargarMensajes: async function() {
        const raw = await fetch(`${url}/mensaje`);
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
        
    },
    mounted: function () {
        // Conecta el socket
        this.socket= io(this.url);
        // Cuando recibo un mensaje
        this.socket.on('nuevo_mensaje', ({status, payload}) => {
            if (status === 200) {
                // Lo agrego a los otros mensajes cargados
                this.mensajes.push(payload.mensaje);
            }
        })

        // Cuando este cliente confirma su conexión al chat
        this.socket.on('conecto_usuario', ({status, payload}) => {
            if (status === 200) {
                // Carga los usuarios a la lista de usuarios
                this.usuarios = payload.usuarios;
            }
        })

        // Cuando se conecta un usuario
        this.socket.on('nuevo_usuario', ({status, payload}) => {
            if (status === 200) {
                // Busco al usuario
                const usuario = this.usuarios.find( u => u.id_usuario == payload.id_usuario);
                // Si existe le cambio el estado
                if (usuario)
                    usuario.status = "CONECTADO"
                else {
                    // Si no existe lo busco y lo agrego
                    fetch(`${url}/usuario?id=${payload.id_usuario}`)
                        .then(response => response.json())
                        .then(({data}) => {
                            this.usuarios = data.usuario;
                        })
                        .catch(err => console.error(err));
                }
            }
        })
        
        // Cuando se desconecta un usuario
        this.socket.on('desconecto_usuario', ({status, payload}) => {
            if (status === 200) {
                const usuario = this.usuarios.find( usuario => usuario.id_usuario == payload.id_usuario)
                if (usuario)
                    usuario.status = "DESCONECTADO"
            }
        })

        this.estaRegistrado().then( id => {
            if (id) {
                this.socket.emit('entra_usuario',{status:200, payload: {id_usuario: id}});
            }
        })
    },
    template : `
      <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent is-9">
            <!-- Media con el Input para mandar mensajes -->
            <div class="tile is-child box">
                <InputMensaje 
                    :id_usuario="id_usuario" 
                    :usuario="usuario" 
                    :socket="socket"
                    :cargarMensajes="cargarMensajes" />
            </div>
            <!-- Lista de Mensajes -->
            <div class="tile is-child box">
                <VerMensajes 
                    :mensajes="mensajes" 
                    :id_usuario="id_usuario" 
                    :usuarios="usuarios"/>
            </div>
        </div>
        <div class="tile is-3">
            <!-- Lista de Usuarios -->
            <MenuUsuarios :usuarios_conectados="usuarios.filter(u => u.status === 'CONECTADO')" 
                          :usuarios_desconectados="usuarios.filter(u => u.status === 'DESCONECTADO')" />
        </div>
        <!-- Notificaciones -->
        <Notificacion :isActive="notificacion_activa" :message="notificacion_mensaje" :hayError="isError" :cerrar="activarNotificacion"/>
      </div>
    `
  });