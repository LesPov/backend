"use strict";
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
exports.generateAndSaveVerificationCode = exports.initializeUserProfile = exports.createNewUserWithRole = exports.handleServerError = void 0;
const generateCode_1 = require("../paswword_generate/generateCode");
const errorMesages_1 = require("../../../middleware/errorMesages");
const rolModel_1 = __importDefault(require("../../../models/rol/rolModel"));
const usuariosModel_1 = __importDefault(require("../../../models/usuarios/usuariosModel"));
const usuariosRolModel_1 = __importDefault(require("../../../models/usuarios_rols/usuariosRolModel"));
const verificationsModel_1 = __importDefault(require("../../../models/verificaciones/verificationsModel"));
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
const VERIFICATION_CODE_EXPIRATION_MINUTES = 1;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerError = (error, res) => {
    console.error("Error en el controlador newUser:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerError = handleServerError;
/**
 * Crea un nuevo usuario en la base de datos y asigna un rol.
 * @param usuario Nombre de usuario.
 * @param hashedPassword Contraseña con hash.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 * @returns El nuevo usuario creado.
 */
const createNewUserWithRole = (usuario, hashedPassword, email, rol) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nuevoUsuario = yield usuariosModel_1.default.create({
            usuario: usuario,
            contrasena: hashedPassword,
            email: email,
        });
        yield assignUserRole(nuevoUsuario.usuario_id, rol);
        return nuevoUsuario;
    }
    catch (error) {
        console.error("Error en createNewUser:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
exports.createNewUserWithRole = createNewUserWithRole;
/**
 * Asigna un rol a un usuario en la base de datos.
 * @param usuarioId ID del usuario.
 * @param rol Rol a asignar.
 */
const assignUserRole = (usuarioId, rol) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectedRol = yield rolModel_1.default.findOne({ where: { nombre: rol } });
        if (!selectedRol) {
            throw new Error(errorMesages_1.errorMessages.invalidRole);
        }
        yield usuariosRolModel_1.default.create({
            usuario_id: usuarioId,
            rol_id: selectedRol.rol_id,
        });
    }
    catch (error) {
        console.error("Error en assignUserRole:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
/**
 * Inicializa el perfil de usuario si es necesario.
 * @param usuarioId ID del usuario.
 */
const initializeUserProfile = (usuarioId) => __awaiter(void 0, void 0, void 0, function* () {
    // Implementa la lógica para inicializar el perfil de usuario si es necesario
});
exports.initializeUserProfile = initializeUserProfile;
/**
 * Genera y guarda un código de verificación en la base de datos.
 * @param usuarioId ID del usuario.
 * @param email Dirección de correo electrónico.
 * @returns El código de verificación generado.
 */
const generateAndSaveVerificationCode = (usuarioId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationCode = (0, generateCode_1.generateVerificationCode)();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    yield verificationsModel_1.default.create({
        usuario_id: usuarioId,
        verificado: false,
        correo_verificado: false,
        codigo_verificacion: verificationCode,
        expiracion_codigo_verificacion: expirationDate,
    });
    return verificationCode;
});
exports.generateAndSaveVerificationCode = generateAndSaveVerificationCode;
