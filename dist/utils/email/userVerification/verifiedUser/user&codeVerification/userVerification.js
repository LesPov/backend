"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInvalidVerificationCode = exports.checkVerificationCodeExpiration = exports.checkUserVerificationStatus = void 0;
const errorMesages_1 = require("../../../../../middleware/errorMesages");
const verificationUtils_1 = require("../verification/verificationUtils");
// Verifica el estado de verificación del usuario
const checkUserVerificationStatus = (user) => {
    if ((0, verificationUtils_1.isUserAlreadyVerified)(user)) {
        throw new Error(errorMesages_1.errorMessages.userAlreadyVerified);
    }
};
exports.checkUserVerificationStatus = checkUserVerificationStatus;
// Verifica si el código de verificación ha expirado
const checkVerificationCodeExpiration = (user, currentDate) => {
    if ((0, verificationUtils_1.isVerificationCodeExpired)(user, currentDate)) {
        throw new Error(errorMesages_1.errorMessages.verificationCodeExpired);
    }
};
exports.checkVerificationCodeExpiration = checkVerificationCodeExpiration;
// Verifica si el código de verificación proporcionado es inválido
const checkInvalidVerificationCode = (user, codigo_verificacion) => {
    if ((0, verificationUtils_1.isInvalidVerificationCode)(user, codigo_verificacion)) {
        throw new Error(errorMesages_1.errorMessages.invalidVerificationCode);
    }
};
exports.checkInvalidVerificationCode = checkInvalidVerificationCode;
