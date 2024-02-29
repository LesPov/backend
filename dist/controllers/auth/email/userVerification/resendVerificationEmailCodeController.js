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
exports.resendVerificationCode = void 0;
const errorMesages_1 = require("../../../../middleware/errorMesages");
const successMessages_1 = require("../../../../middleware/successMessages");
const usuariosModel_1 = __importDefault(require("../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../models/verificaciones/verificationsModel"));
const emailUtils_1 = require("../../../../utils/singup/emailsend/emailUtils");
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const calculateExpirationDate = () => {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return expirationDate;
};
const findOrCreateVerificationRecord = (usuarioId) => __awaiter(void 0, void 0, void 0, function* () {
    let verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id: usuarioId } });
    if (!verificationRecord) {
        verificationRecord = yield verificationsModel_1.default.create({ usuario_id: usuarioId });
    }
    return verificationRecord;
});
const updateVerificationCodeInfo = (verificationRecord, newVerificationCode, expirationDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationRecord.update({ codigo_verificacion: newVerificationCode, expiracion_codigo_verificacion: expirationDate });
});
const sendVerificationCodeByEmail = (email, username, newVerificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, emailUtils_1.sendVerificationEmail)(email, username, newVerificationCode);
});
const isUserNotVerified = (usuario) => !usuario || !usuario.verificacion.correo_verificado;
const resendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const usuario = yield usuariosModel_1.default.findOne({ where: { usuario: username }, include: [verificationsModel_1.default] });
        if (isUserNotVerified(usuario)) {
            const newVerificationCode = generateVerificationCode();
            const expirationDate = calculateExpirationDate();
            const verificationRecord = yield findOrCreateVerificationRecord(usuario.usuario_id);
            yield updateVerificationCodeInfo(verificationRecord, newVerificationCode, expirationDate);
            const emailSent = yield sendVerificationCodeByEmail(usuario.email, usuario.usuario, newVerificationCode);
            if (emailSent) {
                res.json({
                    msg: successMessages_1.successMessages.verificationCodeResent,
                });
            }
            else {
                res.status(500).json({
                    msg: errorMesages_1.errorMessages.emailVerificationError,
                });
            }
        }
        else {
            res.status(400).json({
                msg: errorMesages_1.errorMessages.userAlreadyVerified,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            msg: errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
});
exports.resendVerificationCode = resendVerificationCode;
