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
exports.handleServerErrorLogin = exports.loginUser = exports.handleSuccessfulLogin = exports.generateAuthToken = exports.checkLoginAttemptsAndBlockAccount = exports.verifyUserPassworde = exports.checkUserVerificationStatusLogin = exports.findUserByUsernameLogin = exports.validateVerificationFieldsLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const successMessages_1 = require("../../../middleware/successMessages");
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
const errorMesages_1 = require("../../../middleware/errorMesages");
const usuariosModel_1 = __importDefault(require("../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../models/verificaciones/verificationsModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rolModel_1 = __importDefault(require("../../../models/rol/rolModel"));
// Máximo de intentos de inicio de sesión permitidos
const MAX_LOGIN_ATTEMPTS = 5;
/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsLogin = (usuario, contrasena_aleatoria) => {
    const errors = [];
    if (!usuario || !contrasena_aleatoria) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsLogin = validateVerificationFieldsLogin;
/**
 * Buscar un usuario por nombre de usuario, incluyendo su información de verificación.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernameLogin = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({
        where: { usuario: usuario },
        include: [
            {
                model: verificationsModel_1.default, // Incluye la relación Verificacion
            },
            {
                model: rolModel_1.default, // Incluye la relación con el modelo de rol
            },
        ],
    });
    if (!user) {
        return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
exports.findUserByUsernameLogin = findUserByUsernameLogin;
///////////////////////////////////////////////////////////////////////////
/**
 * Verifica si el correo electrónico del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkEmailVerification = (user, res) => {
    if (!user.verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMesages_1.errorMessages.userNotVerified,
        });
    }
};
/**
 * Verifica si el teléfono del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkPhoneVerification = (user, res) => {
    if (!user.verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMesages_1.errorMessages.phoneVerificationRequired,
        });
    }
};
/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkUserVerificationStatusLogin = (user, res) => {
    checkEmailVerification(user, res);
    checkPhoneVerification(user, res);
};
exports.checkUserVerificationStatusLogin = checkUserVerificationStatusLogin;
/////////////////////////////////////////////////////////////////////////
/**
 * Verifica la contraseña aleatoria del usuario.
 * @param randomPassword Contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria es válida, false en caso contrario.
 */
const verifyRandomPassword = (randomPassword, user) => {
    console.log('Contraseña aleatoria.');
    return randomPassword === user.verificacion.contrasena_aleatoria;
};
/**
 * Verifica la contraseña utilizando bcrypt.
 * @param password Contraseña proporcionada.
 * @param hashedPassword Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Contraseña normal.');
    return yield bcryptjs_1.default.compare(password, hashedPassword);
});
/**
 * Actualiza el número de intentos de inicio de sesión en la tabla de Verificacion.
 * @param user Usuario encontrado.
 */
const updateLoginAttempts = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedLoginAttempts = (user.verificacion.intentos_ingreso || 0) + 1;
    yield verificationsModel_1.default.update({ intentos_ingreso: updatedLoginAttempts }, { where: { usuario_id: user.usuario_id } });
});
/**
 * Bloquea la cuenta si se excede el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleMaxLoginAttempts = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        yield lockAccount(user.usuario);
        res.status(400).json({
            msg: errorMesages_1.errorMessages.accountLocked,
        });
    }
});
/**
 * Verifica la contraseña del usuario.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const verifyUserPassworde = (passwordOrRandomPassword, user, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica si la contraseña es válida
        const passwordValid = yield isPasswordValid(passwordOrRandomPassword, user);
        if (!passwordValid) {
            // Maneja el inicio de sesión fallido
            yield handleFailedLogin(user, res);
        }
    }
    catch (error) {
        console.error('Error al verificar la contraseña:', error);
    }
});
exports.verifyUserPassworde = verifyUserPassworde;
/**
 * Verifica si la contraseña proporcionada es válida.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns True si la contraseña es válida, false en caso contrario.
 */
const isPasswordValid = (passwordOrRandomPassword, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Verifica si la longitud de la contraseña es igual a 8 para determinar si es una contraseña aleatoria
    return passwordOrRandomPassword.length === 8
        ? verifyRandomPassword(passwordOrRandomPassword, user)
        : yield verifyBcryptPassword(passwordOrRandomPassword, user.contrasena);
});
/**
 * Maneja un intento fallido de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleFailedLogin = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Actualiza el número de intentos de inicio de sesión
    yield updateLoginAttempts(user);
    // Maneja el bloqueo de la cuenta si es necesario
    yield handleMaxLoginAttempts(user, res);
    // Envía un mensaje de error al cliente
    res.status(400).json({
        msg: errorMesages_1.errorMessages.incorrectPassword(user.verificacion.intentos_ingreso),
    });
});
//////////////////////////////////////////////////////////////////////////////////////
/**
 * Bloquea la cuenta de un usuario después de múltiples intentos fallidos de inicio de sesión.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se bloqueará.
 * @returns {Promise<void>} No devuelve ningún valor explícito, pero bloquea la cuenta del usuario si es encontrado en la base de datos.
 */
function lockAccount(usuario) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Buscar al usuario en la base de datos por su nombre de usuario y cargar información de verificación asociada.
            const user = yield usuariosModel_1.default.findOne({
                where: { usuario: usuario },
                include: [verificationsModel_1.default],
            });
            // Verificar si el usuario existe en la base de datos.
            if (!user) {
                console.error('Usuario no encontrado');
                return;
            }
            // Calcular la fecha de expiración del bloqueo (3 minutos a partir de la fecha y hora actual).
            const currentDate = new Date();
            const expirationDate = new Date(currentDate.getTime() + 3 * 60 * 1000); // Bloqueo por 3 minutos
            // Actualizar la información en las tablas  'Verificacion' para reflejar el bloqueo de la cuenta.
            yield Promise.all([
                verificationsModel_1.default.update({
                    intentos_ingreso: MAX_LOGIN_ATTEMPTS,
                    expiracion_intentos_ingreso: expirationDate // Actualiza la fecha de expiración de bloqueo
                }, { where: { usuario_id: user.usuario_id } }),
            ]);
        }
        catch (error) {
            console.error('Error al bloquear la cuenta:', error);
        }
    });
}
/**
 * Verifica si el usuario ha excedido el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkLoginAttemptsAndBlockAccount = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        const currentDate = new Date();
        // Verificar si la cuenta está bloqueada y si el bloqueo aún no ha expirado
        if (user.verificacion.expiracion_intentos_ingreso && user.verificacion.expiracion_intentos_ingreso > currentDate) {
            const timeLeft = Math.ceil((user.verificacion.expiracion_intentos_ingreso.getTime() - currentDate.getTime()) / (60 * 1000));
            return res.status(400).json({
                msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
            });
        }
        else {
            // Desbloquear la cuenta nuevamente si el bloqueo ha expirado
            yield unlockAccount(user.usuario);
        }
    }
    // Verificar si la cuenta está bloqueada según la nueva lógica proporcionada
    if (user.verificacion.blockExpiration) {
        const currentDate = new Date();
        if (user.verificacion.blockExpiration > currentDate) {
            const timeLeft = Math.ceil((user.verificacion.blockExpiration.getTime() - currentDate.getTime()) / (60 * 1000));
            return res.status(400).json({
                msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
            });
        }
    }
});
exports.checkLoginAttemptsAndBlockAccount = checkLoginAttemptsAndBlockAccount;
/**
 * Desbloquear la cuenta de un usuario en base a su nombre de usuario.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se desbloqueará.
 * @returns {Promise<void>} No devuelve ningún valor explícito, pero desbloquea la cuenta del usuario si es encontrado en la base de datos.
 */
function unlockAccount(usuario) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Buscar al usuario en la base de datos por su nombre de usuario y cargar información de verificación asociada.
            const user = yield usuariosModel_1.default.findOne({
                where: { usuario: usuario },
                include: [verificationsModel_1.default],
            });
            // Verificar si el usuario existe en la base de datos.
            if (!user) {
                console.error('Usuario no encontrado');
                return;
            }
            // Restablecer el número de intentos de inicio de sesión fallidos a cero en la tabla Verification.
            yield Promise.all([
                verificationsModel_1.default.update({ intentos_ingreso: 0 }, { where: { usuario_id: user.usuario_id } }),
            ]);
        }
        catch (error) {
            console.error('Error al desbloquear la cuenta:', error);
        }
    });
}
///////////////////////////////////////////////////////////////////////////////////
const generateAuthToken = (user) => {
    // Asegúrate de que la propiedad 'roles' esté presente y sea un array
    const roles = Array.isArray(user === null || user === void 0 ? void 0 : user.rols) ? user.rols.map((rol) => rol.nombre) : [];
    return jsonwebtoken_1.default.sign({
        usuario: user.usuario,
        usuario_id: user.usuario_id,
        rol: roles.length > 0 ? roles[0] : null, // Tomar el primer rol si existe, o null si no hay roles
    }, process.env.SECRET_KEY || 'pepito123');
};
exports.generateAuthToken = generateAuthToken;
const handleSuccessfulLogin = (user, res, contrasena) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages_1.successMessages.userLoggedIn;
    const token = (0, exports.generateAuthToken)(user);
    const userId = user.usuario_id;
    const roles = Array.isArray(user.rols) ? user.rols.map((rol) => rol.nombre) : [];
    const rol = roles.length > 0 ? roles[0] : null; // Tomar el primer rol si existe, o null si no hay roles
    const passwordorrandomPassword = contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
    console.log('Tipo de contraseña:', passwordorrandomPassword);
    return res.json({ msg, token, userId, rol, passwordorrandomPassword });
});
exports.handleSuccessfulLogin = handleSuccessfulLogin;
////////////////////////////////////////////////////////////////////
/**
 * Controlador para inicar sesion.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, contrasena_aleatoria } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldsLogin)(usuario, contrasena_aleatoria);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, exports.findUserByUsernameLogin)(usuario, res);
        // Verificar la propiedad de verificación del usuario
        (0, exports.checkUserVerificationStatusLogin)(user, res);
        // Verificar la contraseña del usuario
        yield (0, exports.verifyUserPassworde)(contrasena_aleatoria, user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        yield (0, exports.checkLoginAttemptsAndBlockAccount)(user, res);
        yield (0, exports.handleSuccessfulLogin)(user, res, contrasena_aleatoria);
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, exports.handleServerErrorLogin)(error, res);
    }
});
exports.loginUser = loginUser;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorLogin = (error, res) => {
    console.error("Error en el controlador login:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorLogin = handleServerErrorLogin;
