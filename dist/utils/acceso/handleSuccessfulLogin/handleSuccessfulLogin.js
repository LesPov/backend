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
const successMessages_1 = require("../../../middleware/successMessages");
const generateAuthToken_1 = require("../generateAuthToken/generateAuthToken");
const handleSuccessfulLogin = (user, res, contrasena) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = getMessage(contrasena);
    const token = (0, generateAuthToken_1.generateAuthToken)(user);
    const { userId, rol } = getUserInfo(user);
    return res.json({ msg, token, userId, rol, passwordorrandomPassword: getPasswordOrRandomPassword(user, contrasena) });
});
exports.handleSuccessfulLogin = handleSuccessfulLogin;
const getMessage = (contrasena) => {
    return contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages_1.successMessages.userLoggedIn;
};
const getUserInfo = (user) => {
    const userId = user.usuario_id;
    const rol = Array.isArray(user.rols) && user.rols.length > 0 ? user.rols[0].nombre : null;
    return { userId, rol };
};
const getPasswordOrRandomPassword = (user, contrasena) => {
    return contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
};
