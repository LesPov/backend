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
exports.updateAndClearPasswordResetPass = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/////////////////////////////////////////////////////
/**
 * Actualiza y borra la contraseña del usuario.
 * @param user - Objeto de modelo de usuario.
 * @param verification - Objeto de modelo de verificación.
 * @param newPassword - Nueva contraseña a establecer.
 */
const updateAndClearPasswordResetPass = (user, verificacion, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    user.contrasena = hashedPassword;
    if (verificacion) {
        verificacion.contrasena_aleatoria = '';
        verificacion.intentos_ingreso = 0;
        verificacion.expiracion_codigo_verificacion = new Date();
        yield verificacion.save();
    }
    yield user.save();
});
exports.updateAndClearPasswordResetPass = updateAndClearPasswordResetPass;
