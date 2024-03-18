"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomVerificationDataRecoveryPass = exports.generateRandomPasswordRecoveryPass = void 0;
/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_MINUTES = 3;
/**
 * Genera una contraseña aleatoria.
 * @param {number} length - Longitud de la contraseña generada.
 * @returns {string} - Contraseña aleatoria.
 */
const generateRandomPasswordRecoveryPass = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPassword = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomPassword += characters.charAt(randomIndex);
    }
    return randomPassword;
};
exports.generateRandomPasswordRecoveryPass = generateRandomPasswordRecoveryPass;
/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Objeto con la contraseña aleatoria de 8 dígitos y la fecha de expiración del código de verificación.
 */
const generateRandomVerificationDataRecoveryPass = () => {
    // Generate an 8-digit random password
    const randomPassword = (0, exports.generateRandomPasswordRecoveryPass)(8);
    // Calculate expiration date 2 MINUTOS
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + VERIFICATION_CODE_EXPIRATION_MINUTES);
    // Log the generated password
    console.log('Generated Password:', randomPassword);
    return { randomPassword: randomPassword, expirationDate };
};
exports.generateRandomVerificationDataRecoveryPass = generateRandomVerificationDataRecoveryPass;
