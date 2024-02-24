/**
 * @file server.ts
 * @description Clase que representa el servidor de la aplicación.
 */

import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { Usuario } from './models/usuarios/usuariosModel';
import { Rol } from './models/rol/rolModel';
import { UsuarioRol } from './models/usuarios_rols/usuariosRolModel';
import { Permiso } from './models/permisos/permisosModel';
import { RolPermiso } from './models/permisos_rols/permisosRolModel';
import { Verificacion } from './models/verificaciones/verificationsModel';

export const DB_DATABASE = process.env.DB_DATABASE || 'root'


class Server {

    private app: Application;
    private port: string;

    /**
     * Constructor de la clase Server.
     */
    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3001';
        this.listen();
        this.middlewares();
        this.routes();
        this.dbConnect();
    }

    /**
     * Inicia el servidor y escucha en el puerto especificado.
     */
    listen() {
        this.app.listen(this.port, () => {
            console.log('Aplicacion corriendo en el puerto ' + this.port);
        })
    }

    /**
     * Configura las rutas de la aplicación.
     */
    routes() {
        // this.app.use('/api/auth', signinRoutes, loginRoutes, passwordResetRouter, emailVerificationRoutes, phoneVerificationRouter, countryRoutes);
        // this.app.use('/api/admin', adminRoutes, imageRoutes); // Utiliza las rutas específicas para operaciones administrativas


    }

    /**
     * Configura los middlewares de la aplicación. 
     */
    middlewares() {
        // Parseo body  
        this.app.use(express.json());

        // Servir archivos estáticos desde la carpeta 'uploads'
        // Asegúrate de que la ruta sea correcta y termine con '/'
        this.app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

        // Cors
        this.app.use(cors());
    }

    /**
     * Conecta a la base de datos y sincroniza los modelos de Product y User.
     */
    async dbConnect() {
        try {
            await Usuario.sync();
            await Rol.sync();
            await UsuarioRol.sync();
            await Permiso.sync();
            await RolPermiso.sync();
            await Verificacion.sync();


        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
}


export default Server;
console.log(new Date());


