"use strict";
// utils.ts
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
exports.lockAccount = exports.unlockAccount = void 0;
const usuariosModel_1 = __importDefault(require("../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../models/verificaciones/verificationsModel"));
const MAX_LOGIN_ATTEMPTS = 5; // Número máximo de intentos fallidos antes del bloqueo
function unlockAccount(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield usuariosModel_1.default.findOne({
                where: { usuario: username },
                include: ['verificacion'],
            });
            if (!user) {
                console.error('Usuario no encontrado');
                return;
            }
            yield Promise.all([
                verificationsModel_1.default.update({ intentos_ingreso: 0 }, { where: { usuario_id: user.usuario_id } }),
            ]);
        }
        catch (error) {
            console.error('Error al desbloquear la cuenta:', error);
        }
    });
}
exports.unlockAccount = unlockAccount;
function lockAccount(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield usuariosModel_1.default.findOne({
                where: { usuario: username },
                include: ['verificacion'],
            });
            if (!user) {
                console.error('Usuario no encontrado');
                return;
            }
            const currentDate = new Date();
            const expirationDate = new Date(currentDate.getTime() + 3 * 60 * 1000); // Bloqueo por 3 minutos
            yield Promise.all([
                usuariosModel_1.default.update({
                    loginAttempts: MAX_LOGIN_ATTEMPTS,
                    verificationCodeExpiration: expirationDate,
                    blockExpiration: expirationDate
                }, { where: { usuario: username } }),
                verificationsModel_1.default.update({
                    intentos_ingreso: MAX_LOGIN_ATTEMPTS,
                    codigo_verificacion_expiracion: expirationDate,
                    expiracion_codigo_verificacion: expirationDate
                }, { where: { usuario_id: user.usuario_id } }),
            ]);
        }
        catch (error) {
            console.error('Error al bloquear la cuenta:', error);
        }
    });
}
exports.lockAccount = lockAccount;
