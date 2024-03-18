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
exports.findOrCreateVerificationRecoveryPass = exports.findUserByUsernameRecoveryPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const rolModel_1 = __importDefault(require("../../../../../models/rol/rolModel"));
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * Buscar un usuario por nombre de usuari o email  incluyendo su información de verificación y rol.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernameRecoveryPass = (usernameOrEmail, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = null;
    if (EMAIL_REGEX.test(usernameOrEmail)) {
        user = yield usuariosModel_1.default.findOne({
            where: { email: usernameOrEmail },
            include: [verificationsModel_1.default, rolModel_1.default],
        });
    }
    else {
        user = yield usuariosModel_1.default.findOne({
            where: { usuario: usernameOrEmail },
            include: [verificationsModel_1.default, rolModel_1.default],
        });
    }
    if (!user) {
        res.status(400).json({ msg: errorMessages_1.errorMessages.userNotExists(usernameOrEmail) });
        throw new Error("Usuario no encontrado");
    }
    return user;
});
exports.findUserByUsernameRecoveryPass = findUserByUsernameRecoveryPass;
/**
 * Función que busca un registro de verificación para un usuario en la base de datos.
 * Si no existe, crea uno nuevo.
 * @param usuario_id - ID del usuario.
 * @returns Registro de verificación.
 */
const findOrCreateVerificationRecoveryPass = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    let verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id } });
    if (!verificationRecord) {
        verificationRecord = yield verificationsModel_1.default.create({ usuario_id });
    }
    return verificationRecord;
});
exports.findOrCreateVerificationRecoveryPass = findOrCreateVerificationRecoveryPass;
