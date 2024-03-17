"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserVerificationStatusLogin = void 0;
const errorMessages_1 = require("../../../../middleware/errorMessages");
/**
 * Verifica si el correo electrónico del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkEmailVerification = (user, res) => {
    if (!user.verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMessages_1.errorMessages.userNotVerified,
        });
    }
};
/**
 * Verifica si el teléfono del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkPhoneVerification = (user, res) => {
    if (!user.verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMessages_1.errorMessages.phoneVerificationRequired,
        });
    }
};
/**
 * Verifica si esta  usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkVerificationverificado = (user, res) => {
    if (!user.verificacion.verificado) {
        return res.status(400).json({
            msg: errorMessages_1.errorMessages.verificadoVericationRequired,
        });
    }
};
/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkUserVerificationStatusLogin = (user, res) => {
    checkEmailVerification(user, res);
    checkPhoneVerification(user, res);
    checkVerificationverificado(user, res);
};
exports.checkUserVerificationStatusLogin = checkUserVerificationStatusLogin;
