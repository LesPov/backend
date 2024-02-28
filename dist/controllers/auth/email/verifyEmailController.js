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
const findUserByUsername = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    return usuariosModel_1.default.findOne({ where: { usuario: usuario }, include: [verificationsModel_1.default] });
});
const isUserAlreadyVerified = (user) => {
    return user.correo_verificado;
};
const isVerificationCodeExpired = (user, currentDate) => {
    return user.expiracion_codigo_verificacion && user.expiracion_codigo_verificacion < currentDate;
};
const isInvalidVerificationCode = (user, codigo_verificacion) => {
    return user.verificacion.codigo_verificacion !== codigo_verificacion.trim();
};
const markEmailAsVerified = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({ correo_verificado: true }, { where: { usuario_id } });
});
const markUserAsVerified = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({ isVerified: true }, { where: { usuario_id } });
});
const checkUserVerificationStatus = (user) => {
    if (isUserAlreadyVerified(user)) {
        throw new Error(errorMesages_1.errorMessages.userAlreadyVerified);
    }
};
const checkVerificationCodeExpiration = (user, currentDate) => {
    if (isVerificationCodeExpired(user, currentDate)) {
        throw new Error(errorMesages_1.errorMessages.verificationCodeExpired);
    }
};
const checkInvalidVerificationCode = (user, codigo_verificacion) => {
    if (isInvalidVerificationCode(user, codigo_verificacion)) {
        throw new InvalidVerificationCodeError(errorMesages_1.errorMessages.invalidVerificationCode);
    }
};
const handleEmailVerification = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield markEmailAsVerified(usuario_id);
});
const handleUserVerification = (usuario_id, celular_verificado) => __awaiter(void 0, void 0, void 0, function* () {
    if (celular_verificado) {
        yield markUserAsVerified(usuario_id);
    }
});
const handleVerification = (user, codigo_verificacion, currentDate) => __awaiter(void 0, void 0, void 0, function* () {
    checkUserVerificationStatus(user);
    checkVerificationCodeExpiration(user, currentDate);
    checkInvalidVerificationCode(user, codigo_verificacion);
    yield handleEmailVerification(user.usuario_id);
    yield handleUserVerification(user.usuario_id, user.celular_verificado);
});
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
    }
}
class InvalidVerificationCodeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidVerificationCodeError';
    }
}
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usuario, codigo_verificacion } = req.body;
    try {
        const user = yield findUserByUsername(usuario);
        if (!user) {
            return res.status(400).json({
                msg: errorMesages_1.errorMessages.userExists(usuario),
            });
        }
        const currentDate = new Date();
        yield handleVerification(user, codigo_verificacion, currentDate);
        res.json({
            msg: successMessages_1.successMessages.userVerified,
        });
    }
    catch (error) {
        if (error instanceof InvalidVerificationCodeError) {
            return res.status(403).json({
                msg: error.message,
            });
        }
        else if (error instanceof UnauthorizedError) {
            return res.status(401).json({
                msg: error.message,
            });
        }
        res.status(400).json({
            msg: errorMesages_1.errorMessages.databaseError,
            error: error.message,
        });
    }
});
exports.verifyUser = verifyUser;
