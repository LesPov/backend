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
exports.checkUserPhoneNumberExistsPhoneSend = exports.checkPhoneNumberAvailabilityPhoneSend = exports.isUserAlreadyVerifiedPhoneSend = exports.checkUserVerificationStatusPhoneSend = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
/**
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
const checkUserVerificationStatusPhoneSend = (user) => {
    if ((0, exports.isUserAlreadyVerifiedPhoneSend)(user)) {
        throw new Error(errorMessages_1.errorMessages.userAlreadyVerified);
    }
};
exports.checkUserVerificationStatusPhoneSend = checkUserVerificationStatusPhoneSend;
/**
 * Verificar si el usuario ya ha sido verificado en las tablas verifcado o correo_verifcado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
const isUserAlreadyVerifiedPhoneSend = (user) => {
    return user.verificacion.verificado || user.verificacion.celular_verificado;
};
exports.isUserAlreadyVerifiedPhoneSend = isUserAlreadyVerifiedPhoneSend;
/**
 * Verificar la disponibilidad del número de teléfono en la base de datos.
 * @param celular Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 * @throws Error si el número de teléfono ya está registrado.
 */
const checkPhoneNumberAvailabilityPhoneSend = (celular) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield usuariosModel_1.default.findOne({ where: { celular: celular } });
    if (existingUser) {
        throw new Error(errorMessages_1.errorMessages.phoneNumberExists);
    }
});
exports.checkPhoneNumberAvailabilityPhoneSend = checkPhoneNumberAvailabilityPhoneSend;
/**
 * Verificar si el número de teléfono ya está asociado al usuario actual.
 * @param user Usuario actual.
 * @param celular Número de teléfono a verificar.
 * @throws Error si el número de teléfono ya está asociado al usuario actual.
 */
const checkUserPhoneNumberExistsPhoneSend = (user, celular) => {
    if (user.celular === celular) {
        throw new Error(errorMessages_1.errorMessages.phoneNumberInUse);
    }
};
exports.checkUserPhoneNumberExistsPhoneSend = checkUserPhoneNumberExistsPhoneSend;
