"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserAlreadyVerifiedPhoneVerify = exports.checkUserVerificationStatusPhoneVerify = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
/**
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
const checkUserVerificationStatusPhoneVerify = (user) => {
    if ((0, exports.isUserAlreadyVerifiedPhoneVerify)(user)) {
        throw new Error(errorMessages_1.errorMessages.userAlreadyVerified);
    }
};
exports.checkUserVerificationStatusPhoneVerify = checkUserVerificationStatusPhoneVerify;
/**
 * Verificar si el usuario ya ha sido verificado en celular_verificado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
const isUserAlreadyVerifiedPhoneVerify = (user) => {
    return user.verificacion.celular_verificado;
};
exports.isUserAlreadyVerifiedPhoneVerify = isUserAlreadyVerifiedPhoneVerify;
