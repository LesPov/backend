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
exports.checkExistingUser = exports.handleExistingUserError = void 0;
const errorMesages_1 = require("../../middleware/errorMesages");
const usuariosModel_1 = __importDefault(require("../../models/usuarios/usuariosModel"));
/**
 * Maneja los errores relacionados con la existencia de un usuario.
 * @param error Mensaje de error si el usuario ya existe, de lo contrario, null.
 * @param res La respuesta HTTP saliente.
 */
const handleExistingUserError = (error, res) => {
    if (error) {
        res.status(400).json({
            msg: error,
        });
    }
};
exports.handleExistingUserError = handleExistingUserError;
/**
 * Verifica si un usuario o correo electrónico ya existe.
 * @param usuario Nombre de usuario.
 * @param email Dirección de correo electrónico.
 * @returns Mensaje de error si el usuario o correo electrónico ya existe, de lo contrario, null.
 */
const checkExistingUser = (usuario, email) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield checkExistingUsername(usuario)) ||
        (yield checkExistingEmail(email)) ||
        null);
});
exports.checkExistingUser = checkExistingUser;
/**
 * Verifica si un nombre de usuario ya existe.
 * @param usuario Nombre de usuario a verificar.
 * @returns Mensaje de error si el nombre de usuario ya existe, de lo contrario, null.
 */
const checkExistingUsername = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield findExistingUsername(usuario))
        ? errorMesages_1.errorMessages.userExists(usuario)
        : null;
});
/**
 * Verifica si una dirección de correo electrónico ya existe.
 * @param email Dirección de correo electrónico a verificar.
 * @returns Mensaje de error si la dirección de correo electrónico ya existe, de lo contrario, null.
 */
const checkExistingEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield findExistingEmail(email))
        ? errorMesages_1.errorMessages.userEmailExists(email)
        : null;
});
/**
 * Busca si un nombre de usuario ya existe en la base de datos.
 * @param usuario Nombre de usuario a buscar.
 * @returns True si el nombre de usuario existe, de lo contrario, false.
 */
const findExistingUsername = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUsuario = yield usuariosModel_1.default.findOne({ where: { usuario } });
        return Boolean(existingUsuario);
    }
    catch (error) {
        console.error("Error en findExistingUsername:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
/**
 * Busca si una dirección de correo electrónico ya existe en la base de datos.
 * @param email Dirección de correo electrónico a buscar.
 * @returns True si la dirección de correo electrónico existe, de lo contrario, false.
 */
const findExistingEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingEmail = yield usuariosModel_1.default.findOne({ where: { email } });
        return Boolean(existingEmail);
    }
    catch (error) {
        console.error("Error en findExistingEmail:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
