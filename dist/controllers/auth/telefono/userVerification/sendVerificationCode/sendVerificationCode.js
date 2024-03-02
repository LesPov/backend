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
exports.sendVerificationCode = exports.findUserByUsernamePhoneSend = void 0;
const errorMesages_1 = require("../../../../../middleware/errorMesages");
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const userVerification_1 = require("../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const validateVerificationFieldsPhoneSend = (usuario, celular) => {
    const errors = [];
    if (!usuario || !celular) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
// Busca un usuario por nombre de usuario, incluyendo su información de verificación
const findUserByUsernamePhoneSend = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({ where: { usuario: usuario } });
    if (!user) {
        return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
exports.findUserByUsernamePhoneSend = findUserByUsernamePhoneSend;
const sendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, exports.findUserByUsernamePhoneSend)(usuario, res);
        (0, userVerification_1.checkUserVerificationStatus)(user);
    }
    catch (_a) {
    }
});
exports.sendVerificationCode = sendVerificationCode;
