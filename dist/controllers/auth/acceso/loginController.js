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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const errorMesages_1 = require("../../../middleware/errorMesages");
const successMessages_1 = require("../../../middleware/successMessages");
const authService_1 = require("../../../services/login/authService");
const userService_1 = require("../../../services/login/userService");
const userUtils_1 = require("../../../utils/login/userUtils");
const MAX_LOGIN_ATTEMPTS = 5;
const handleLockedAccount = (username, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, userUtils_1.lockAccount)(username);
    return res.status(400).json({ msg: errorMesages_1.errorMessages.accountLocked });
});
const handleIncorrectPassword = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedLoginAttempts = yield incrementLoginAttempts(user);
    if (updatedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        return handleLockedAccount(user.username, res);
    }
    const errorMessage = errorMesages_1.errorMessages.incorrectPassword(updatedLoginAttempts);
    return sendBadRequest(res, errorMessage);
});
const incrementLoginAttempts = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedLoginAttempts = (user.verification.intentos_ingreso || 0) + 1;
    yield user.verification.update({ intentos_ingreso: updatedLoginAttempts });
    return updatedLoginAttempts;
});
const sendBadRequest = (res, msg) => res.status(400).json({ msg });
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, passwordorrandomPassword } = req.body;
        const user = yield authenticateUser(username, passwordorrandomPassword, res);
        if (user) {
            yield handleSuccessfulLogin(user, res, passwordorrandomPassword);
        }
    }
    catch (error) {
        handleErrorResponse(res, error);
    }
});
exports.loginUser = loginUser;
const authenticateUser = (username, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserByUsernameOrThrow(username);
    verifyUserVerification(user, res);
    validateUserPassword(user, password, res);
    yield (0, userService_1.resetLoginAttempts)(user);
    return user;
});
const validateUserPassword = (user, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, authService_1.validatePassword)(user, password))) {
        handleIncorrectPassword(user, res);
    }
});
const handleSuccessfulLogin = (user, res, password) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = password.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages_1.successMessages.userLoggedIn;
    const token = (0, authService_1.generateAuthToken)(user);
    const userId = user.usuario_id;
    const rol = user.rol.nombre; // Assuming 'rol' is the association between Usuario and Rol
    const passwordorrandomPassword = password.length === 8 ? 'randomPassword' : undefined;
    return res.json({ msg, token, userId, rol, passwordorrandomPassword });
});
const handleErrorResponse = (res, error) => {
    if (!res.headersSent) {
        return res.status(500).json({ msg: errorMesages_1.errorMessages.databaseError, error });
    }
};
const getUserByUsernameOrThrow = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, userService_1.getUserByUsername)(username);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
});
const verifyUserVerification = (user, res) => {
    if (!isUserVerified(user, res) || handleBlockExpiration(user, res)) {
        throw new Error("User verification failed");
    }
};
const verifyUser = (username, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserByUsernameOrThrow(username);
        verifyUserVerification(user, res);
        return user;
    }
    catch (error) {
        throw error;
    }
});
const isUserVerified = (user, res) => {
    const isEmailValid = user.verification.correo_verificado;
    const isPhoneValid = user.verification.celular_verificado;
    return isEmailValid && isPhoneValid;
};
const isAccountBlocked = (user) => {
    const blockExpiration = user.verification.expiracion_codigo_verificacion;
    const currentDate = new Date();
    return blockExpiration && blockExpiration > currentDate;
};
const sendAccountBlockedResponse = (res, timeLeft) => {
    res.status(400).json({ msg: errorMesages_1.errorMessages.accountLockedv1(timeLeft) });
};
const handleBlockExpiration = (user, res) => {
    if (isAccountBlocked(user)) {
        const timeLeft = calculateTimeLeft(user.verification.expiracion_codigo_verificacion, new Date());
        sendAccountBlockedResponse(res, timeLeft);
        return true;
    }
    return false;
};
const calculateTimeLeft = (blockExpiration, currentDate) => {
    const minutesLeft = Math.ceil((blockExpiration.getTime() - currentDate.getTime()) / (60 * 1000));
    return minutesLeft.toString();
};
