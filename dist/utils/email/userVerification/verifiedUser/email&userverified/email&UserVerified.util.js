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
exports.handleVerification = exports.handleUserVerification = exports.handleEmailVerification = exports.markUserAsVerified = exports.markEmailAsVerified = void 0;
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const userVerification_1 = require("../user&codeVerification/userVerification");
// Marca el correo electrónico del usuario como verificado
const markEmailAsVerified = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({ correo_verificado: true }, { where: { usuario_id } });
});
exports.markEmailAsVerified = markEmailAsVerified;
// Marca al usuario como verificado
const markUserAsVerified = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({ verificado: true }, { where: { usuario_id } });
});
exports.markUserAsVerified = markUserAsVerified;
// Maneja la verificación del correo electrónico del usuario
const handleEmailVerification = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.markEmailAsVerified)(usuario_id);
});
exports.handleEmailVerification = handleEmailVerification;
// Maneja la verificación del usuario (si está asociado a un número de teléfono)
const handleUserVerification = (usuario_id, celular_verificado) => __awaiter(void 0, void 0, void 0, function* () {
    if (celular_verificado) {
        yield (0, exports.markUserAsVerified)(usuario_id);
    }
});
exports.handleUserVerification = handleUserVerification;
// Maneja la verificación del usuario, verificando el correo electrónico y el usuario en sí
const handleVerification = (user, codigo_verificacion, currentDate) => __awaiter(void 0, void 0, void 0, function* () {
    (0, userVerification_1.checkUserVerificationStatus)(user);
    (0, userVerification_1.checkVerificationCodeExpiration)(user, currentDate);
    (0, userVerification_1.checkInvalidVerificationCode)(user, codigo_verificacion);
    yield (0, exports.handleEmailVerification)(user.usuario_id);
    yield (0, exports.handleUserVerification)(user.usuario_id, user.verificacion.celular_verificado);
});
exports.handleVerification = handleVerification;
