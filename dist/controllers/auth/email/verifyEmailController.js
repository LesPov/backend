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
exports.verifyUser = void 0;
const usuariosModel_1 = __importDefault(require("../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../models/verificaciones/verificationsModel"));
const errorMesages_1 = require("../../../middleware/errorMesages");
const successMessages_1 = require("../../../middleware/successMessages");
// Busca un usuario por nombre de usuario, incluyendo su información de verificación
const findUserByUsername = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    return usuariosModel_1.default.findOne({ where: { usuario: usuario }, include: [verificationsModel_1.default] });
});
// Verifica si el usuario ya está verificado por correo electrónico
const isUserAlreadyVerified = (user) => {
    return user.verificacion.correo_verificado;
};
// Verifica si el código de verificación ha expirado
const isVerificationCodeExpired = (user, currentDate) => {
    return user.verificacion.expiracion_codigo_verificacion &&
        user.verificacion.expiracion_codigo_verificacion < currentDate;
};
// Verifica si el código de verificación proporcionado es válido
const isInvalidVerificationCode = (user, codigo_verificacion) => {
    return user.verificacion.codigo_verificacion !== codigo_verificacion.trim();
};
// Marca el correo electrónico del usuario como verificado
const markEmailAsVerified = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({ correo_verificado: true }, { where: { usuario_id } });
});
// Marca al usuario como verificado
const markUserAsVerified = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({ verificado: true }, { where: { usuario_id } });
});
// Verifica el estado de verificación del usuario
const checkUserVerificationStatus = (user) => {
    if (isUserAlreadyVerified(user)) {
        throw new Error(errorMesages_1.errorMessages.userAlreadyVerified);
    }
};
// Verifica si el código de verificación ha expirado
const checkVerificationCodeExpiration = (user, currentDate) => {
    if (isVerificationCodeExpired(user, currentDate)) {
        throw new Error(errorMesages_1.errorMessages.verificationCodeExpired);
    }
};
// Verifica si el código de verificación proporcionado es inválido
const checkInvalidVerificationCode = (user, codigo_verificacion) => {
    if (isInvalidVerificationCode(user, codigo_verificacion)) {
        throw new Error(errorMesages_1.errorMessages.invalidVerificationCode);
    }
};
// Maneja la verificación del correo electrónico del usuario
const handleEmailVerification = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield markEmailAsVerified(usuario_id);
});
// Maneja la verificación del usuario (si está asociado a un número de teléfono)
const handleUserVerification = (usuario_id, celular_verificado) => __awaiter(void 0, void 0, void 0, function* () {
    if (celular_verificado) {
        yield markUserAsVerified(usuario_id);
    }
});
// Maneja la verificación del usuario, verificando el correo electrónico y el usuario en sí
const handleVerification = (user, codigo_verificacion, currentDate) => __awaiter(void 0, void 0, void 0, function* () {
    checkUserVerificationStatus(user);
    checkVerificationCodeExpiration(user, currentDate);
    checkInvalidVerificationCode(user, codigo_verificacion);
    yield handleEmailVerification(user.usuario_id);
    yield handleUserVerification(user.usuario_id, user.verificacion.celular_verificado);
});
// Controlador principal para verificar al usuario
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, codigo_verificacion } = req.body;
        // Buscar al usuario por nombre de usuario
        const user = yield findUserByUsername(usuario);
        if (!user) {
            return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
        }
        // Validar si el usuario ya está verificado
        checkUserVerificationStatus(user);
        // Validar si el código de verificación ha expirado
        const currentDate = new Date();
        checkVerificationCodeExpiration(user, currentDate);
        // Validar si el código de verificación proporcionado es válido
        checkInvalidVerificationCode(user, codigo_verificacion);
        // Realizar las operaciones de verificación
        yield handleVerification(user, codigo_verificacion, currentDate);
        // Responder con un mensaje de éxito
        res.json({ msg: successMessages_1.successMessages.userVerified });
    }
    catch (error) {
        // Manejar errores
        res.status(400).json({ msg: error.message }); // Enviar el mensaje de error del objeto de error
    }
});
exports.verifyUser = verifyUser;
