"use strict";
/**
 * @file server.ts
 * @description Clase que representa el servidor de la aplicación.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_DATABASE = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const usuariosModel_1 = require("./models/usuarios/usuariosModel");
const rolModel_1 = require("./models/rol/rolModel");
const usuariosRolModel_1 = require("./models/usuarios_rols/usuariosRolModel");
const permisosModel_1 = require("./models/permisos/permisosModel");
const permisosRolModel_1 = require("./models/permisos_rols/permisosRolModel");
const verificationsModel_1 = require("./models/verificaciones/verificationsModel");
const singupRoutes_1 = __importDefault(require("./routers/auth/registro/singupRoutes")); // Importar las rutas de signin
const emailVerificationRoutes_1 = __importDefault(require("./routers/auth/email/emailVerificationRoutes"));
const phoneSendRoutes_1 = __importDefault(require("./routers/auth/telefono/phoneSendRoutes"));
const loginController_1 = require("./controllers/auth/acceso/loginController");
const adminVerificationRoutes_1 = __importDefault(require("./routers/auth/acceso/admin/adminVerificationRoutes")); // Importa las nuevas rutas administrativas
const userVerificationRoutes_1 = __importDefault(require("./routers/auth/acceso/user/userVerificationRoutes")); // Importa las nuevas rutas administrativas
exports.DB_DATABASE = process.env.DB_DATABASE || 'root';
class Server {
    /**
     * Constructor de la clase Server.
     */
    constructor() {
        this.app = (0, express_1.default)();
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
        });
    }
    /**
     * Configura las rutas de la aplicación.
     */
    routes() {
        this.app.use('/api/auth', adminVerificationRoutes_1.default, userVerificationRoutes_1.default, singupRoutes_1.default, emailVerificationRoutes_1.default, phoneSendRoutes_1.default, loginController_1.loginUser);
    }
    /**
     * Configura los middlewares de la aplicación.
     */
    middlewares() {
        // Parseo body  
        this.app.use(express_1.default.json({ strict: false }));
        // Servir archivos estáticos desde la carpeta 'uploads'
        // Asegúrate de que la ruta sea correcta y termine con '/'
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
        // Cors
        this.app.use((0, cors_1.default)());
    }
    /**
     * Conecta a la base de datos y sincroniza los modelos de Product y User.
     */
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield usuariosModel_1.Usuario.sync();
                yield rolModel_1.Rol.sync();
                yield usuariosRolModel_1.UsuarioRol.sync();
                yield permisosModel_1.Permiso.sync();
                yield permisosRolModel_1.RolPermiso.sync();
                yield verificationsModel_1.Verificacion.sync();
            }
            catch (error) {
                console.error('Unable to connect to the database:', error);
            }
        });
    }
}
exports.default = Server;
console.log(new Date());
