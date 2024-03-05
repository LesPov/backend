"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserAlreadyVerifiedPhoneResend = exports.checkUserVerificationStatusPhoneResend = void 0;
const errorMesages_1 = require("../../../../../middleware/errorMesages");
// Verifica el estado de verificación del usuario
const checkUserVerificationStatusPhoneResend = (user) => {
    if ((0, exports.isUserAlreadyVerifiedPhoneResend)(user)) {
        throw new Error(errorMesages_1.errorMessages.phoneAlreadyVerified);
    }
};
exports.checkUserVerificationStatusPhoneResend = checkUserVerificationStatusPhoneResend;
// Verifica si el usuario ya está verificado por correo electrónico
const isUserAlreadyVerifiedPhoneResend = (user) => {
    return user.verificacion.celular_verificado;
};
exports.isUserAlreadyVerifiedPhoneResend = isUserAlreadyVerifiedPhoneResend;
