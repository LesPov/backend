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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSuccessfulLogin = void 0;
// Importación de módulos y funciones necesarios
const successMessages_1 = require("../../../../middleware/successMessages");
const generateAuthToken_1 = require("../generateAuthToken/generateAuthToken");
/**
 * Maneja un inicio de sesión exitoso y devuelve la respuesta JSON con la información necesaria.
 * @param user - Información del usuario que inició sesión.
 * @param res - Objeto de respuesta de Express.
 * @param contrasena - Contraseña proporcionada durante el inicio de sesión.
 * @returns Respuesta JSON con mensajes, token de autenticación y detalles del usuario.
 */
const handleSuccessfulLogin = (user, res, contrasena) => __awaiter(void 0, void 0, void 0, function* () {
    // Obtiene el mensaje adecuado según la longitud de la contraseña.
    const msg = getMessage(contrasena);
    // Genera un token de autenticación para el usuario.
    const token = (0, generateAuthToken_1.generateAuthToken)(user);
    // Obtiene la información del usuario, como el ID y el rol.
    const { userId, rol } = getUserInfo(user);
    // Retorna la respuesta JSON con mensajes, token, ID de usuario, rol y contraseña aleatoria si es aplicable.
    return res.json({ msg, token, userId, rol, passwordorrandomPassword: getPasswordOrRandomPassword(user, contrasena) });
});
exports.handleSuccessfulLogin = handleSuccessfulLogin;
/**
 * Determina el mensaje en función de la longitud de la contraseña.
 * @param contrasena - Contraseña proporcionada durante el inicio de sesión.
 * @returns Mensaje adecuado según la longitud de la contraseña.
 */
const getMessage = (contrasena) => {
    return contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages_1.successMessages.userLoggedIn;
};
/**
 * Obtiene la información esencial del usuario, como el ID y el rol.
 * @param user - Información del usuario que inició sesión.
 * @returns Objeto con el ID de usuario y el rol (puede ser nulo).
 */
const getUserInfo = (user) => {
    const userId = user.usuario_id;
    const rol = Array.isArray(user.rols) && user.rols.length > 0 ? user.rols[0].nombre : null;
    return { userId, rol };
};
/**
 * Obtiene la contraseña aleatoria del usuario si la longitud de la contraseña es 8.
 * @param user - Información del usuario que inició sesión.
 * @param contrasena - Contraseña proporcionada durante el inicio de sesión.
 * @returns Contraseña aleatoria del usuario o indefinido si la longitud de la contraseña no es 8.
 */
const getPasswordOrRandomPassword = (user, contrasena) => {
    return contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
};
