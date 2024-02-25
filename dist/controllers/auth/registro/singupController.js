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
exports.newUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuariosModel_1 = require("../../../models/usuarios/usuariosModel");
const rolModel_1 = require("../../../models/rol/rolModel");
const usuariosRolModel_1 = require("../../../models/usuarios_rols/usuariosRolModel");
const verificationsModel_1 = require("../../../models/verificaciones/verificationsModel");
const emailUtils_1 = require("../../../utils/emailUtils");
const generateCode_1 = require("../../../utils/generateCode");
const errorMesages_1 = require("../../../middleware/errorMesages");
const successMessages_1 = require("../../../middleware/successMessages");
//Se puede reutilizar : Estas constantes pueden ser útiles en cualquier contexto donde se necesite validar contraseñas.
// Constantes para la validación de contraseña y código de verificación
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REGEX_NUMBER = /\d/;
const PASSWORD_REGEX_UPPERCASE = /[A-Z]/;
const PASSWORD_REGEX_LOWERCASE = /[a-z]/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
/**
 * Controlador para registrar un nuevo usuario.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
const newUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, contrasena, email, rol } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateInput(usuario, contrasena, email, rol);
        if (inputValidationErrors.length > 0) {
            const errorMessage = inputValidationErrors.join('. ');
            res.status(400).json({
                msg: errorMessage,
                errors: `Error en la validación de la contraseña`,
            });
            return;
        }
        // Validar los requisitos de la contraseña
        const passwordValidationErrors = validatePasswordRequirements(contrasena);
        if (passwordValidationErrors.length > 0) {
            handlePasswordValidationErrors(passwordValidationErrors, res);
            return;
        }
        // Validar el formato del correo electrónico
        validateEmail(email);
        // Verificar si el usuario o el correo electrónico ya existen
        const existingUserError = yield checkExistingUser(usuario, email);
        handleExistingUserError(existingUserError, res);
        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = yield bcryptjs_1.default.hash(contrasena, 10);
        // Crear un nuevo usuario en la base de datos
        const newUser = yield createNewUser(usuario, hashedPassword, email, rol);
        // Inicializar el perfil de usuario si es necesario
        yield initializeUserProfile(newUser.usuario_id);
        // Generar y guardar un código de verificación
        const verificationCode = yield generateAndSaveVerificationCode(newUser.usuario_id, email);
        // Enviar un correo electrónico de verificación
        yield (0, emailUtils_1.sendVerificationEmail)(email, usuario, verificationCode);
        // Obtener el mensaje de éxito según el rol del usuario
        const userMessage = getRoleMessage(rol);
        // Responder con un mensaje de éxito
        res.json({
            msg: successMessages_1.successMessages.userRegistered(usuario, userMessage),
        });
    }
    catch (error) {
        // Manejar errores internos del servidor
        handleServerError(error, res);
    }
});
exports.newUser = newUser;
//Se puede reutilizar:Para que 
/**
 * Valida que los campos de entrada no estén vacíos.
 * @param usuario Nombre de usuario.
 * @param contrasena Contraseña.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 */
const validateInput = (usuario, contrasena, email, rol) => {
    const errors = [];
    if (!usuario) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    // ... (validar otros campos)
    return errors;
};
//Se puede reutilizar:Para que 
/**
 * Maneja los errores de validación de la contraseña.
 * @param errors Lista de errores de validación de la contraseña.
 * @param res La respuesta HTTP saliente.
 */
const handlePasswordValidationErrors = (errors, res) => {
    if (errors.length > 0) {
        res.status(400).json({
            msg: errors,
            errors: 'Error en la validación de la contraseña',
        });
    }
};
//Se puede reutilizar:Para que 
/**
 * Maneja los errores relacionados con la existencia de un usuario.
 * @param error Mensaje de error si el usuario ya existe, de lo contrario, null.
 * @param res La respuesta HTTP saliente.
 */
const handleExistingUserError = (error, res) => {
    if (error) {
        res.status(400).json({
            msg: error,
        });
    }
};
//Se puede reutilizar:Para que 
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerError = (error, res) => {
    console.error("Error en el controlador newUser:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña cumple con los requisitos.
 * @param contrasena La contraseña a validar.
 * @returns Lista de errores de validación de la contraseña.
 */
const validatePasswordRequirements = (contrasena) => {
    const errors = [];
    validateLength(contrasena, errors);
    validateNumber(contrasena, errors);
    validateUppercase(contrasena, errors);
    validateLowercase(contrasena, errors);
    return errors;
};
//Se puede reutilizar:Para que 
/**
 * Valida la longitud de la contraseña.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateLength = (contrasena, errors) => {
    if (contrasena.length < PASSWORD_MIN_LENGTH) {
        errors.push(errorMesages_1.errorMessages.passwordTooShort);
    }
};
//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña contiene al menos un número.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateNumber = (contrasena, errors) => {
    if (!PASSWORD_REGEX_NUMBER.test(contrasena)) {
        errors.push(errorMesages_1.errorMessages.passwordNoNumber);
    }
};
//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña contiene al menos una letra mayúscula.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateUppercase = (contrasena, errors) => {
    if (!PASSWORD_REGEX_UPPERCASE.test(contrasena)) {
        errors.push(errorMesages_1.errorMessages.passwordNoUppercase);
    }
};
//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña contiene al menos una letra minúscula.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateLowercase = (contrasena, errors) => {
    if (!PASSWORD_REGEX_LOWERCASE.test(contrasena)) {
        errors.push(errorMesages_1.errorMessages.passwordNoLowercase);
    }
};
//Se puede reutilizar:Para que 
/**
 * Valida el formato del correo electrónico.
 * @param email El correo electrónico a validar.
 */
const validateEmail = (email) => {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error(errorMesages_1.errorMessages.invalidEmail);
    }
};
//Se puede reutilizar:Para que 
/**
 * Verifica si un usuario o correo electrónico ya existe.
 * @param usuario Nombre de usuario.
 * @param email Dirección de correo electrónico.
 * @returns Mensaje de error si el usuario o correo electrónico ya existe, de lo contrario, null.
 */
const checkExistingUser = (usuario, email) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield checkExistingUsername(usuario)) ||
        (yield checkExistingEmail(email)) ||
        null);
});
//Se puede reutilizar:Para que 
/**
 * Verifica si un nombre de usuario ya existe.
 * @param usuario Nombre de usuario a verificar.
 * @returns Mensaje de error si el nombre de usuario ya existe, de lo contrario, null.
 */
const checkExistingUsername = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield findExistingUsername(usuario))
        ? errorMesages_1.errorMessages.userExists(usuario)
        : null;
});
//Se puede reutilizar:Para que 
/**
 * Verifica si una dirección de correo electrónico ya existe.
 * @param email Dirección de correo electrónico a verificar.
 * @returns Mensaje de error si la dirección de correo electrónico ya existe, de lo contrario, null.
 */
const checkExistingEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield findExistingEmail(email))
        ? errorMesages_1.errorMessages.userEmailExists(email)
        : null;
});
/**
 * Busca si un nombre de usuario ya existe en la base de datos.
 * @param usuario Nombre de usuario a buscar.
 * @returns True si el nombre de usuario existe, de lo contrario, false.
 */
const findExistingUsername = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUsuario = yield usuariosModel_1.Usuario.findOne({ where: { usuario } });
        return Boolean(existingUsuario);
    }
    catch (error) {
        console.error("Error en findExistingUsername:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
/**
 * Busca si una dirección de correo electrónico ya existe en la base de datos.
 * @param email Dirección de correo electrónico a buscar.
 * @returns True si la dirección de correo electrónico existe, de lo contrario, false.
 */
const findExistingEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingEmail = yield usuariosModel_1.Usuario.findOne({ where: { email } });
        return Boolean(existingEmail);
    }
    catch (error) {
        console.error("Error en findExistingEmail:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
//Se puede reutilizar:Para que 
/**
 * Crea un nuevo usuario en la base de datos.
 * @param usuario Nombre de usuario.
 * @param hashedPassword Contraseña con hash.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 * @returns El nuevo usuario creado.
 */
const createNewUser = (usuario, hashedPassword, email, rol) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nuevoUsuario = yield usuariosModel_1.Usuario.create({
            usuario: usuario,
            contrasena: hashedPassword,
            email: email,
        });
        // Asigna el rol al usuario
        yield assignUserRole(nuevoUsuario.usuario_id, rol);
        return nuevoUsuario;
    }
    catch (error) {
        console.error("Error en createNewUser:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
/**
 * Asigna un rol a un usuario en la base de datos.
 * @param usuarioId ID del usuario.
 * @param rol Rol a asignar.
 */
const assignUserRole = (usuarioId, rol) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Busca el rol en la base de datos
        const selectedRol = yield rolModel_1.Rol.findOne({ where: { nombre: rol } });
        if (!selectedRol) {
            throw new Error(errorMesages_1.errorMessages.invalidRole);
        }
        // Asigna el rol al usuario
        yield usuariosRolModel_1.UsuarioRol.create({
            usuario_id: usuarioId,
            rol_id: selectedRol.rol_id,
        });
    }
    catch (error) {
        console.error("Error en assignUserRole:", error);
        throw errorMesages_1.errorMessages.databaseError;
    }
});
//Se puede reutilizar:Para que 
/**
 * Inicializa el perfil de usuario si es necesario.
 * @param usuarioId ID del usuario.
 */
const initializeUserProfile = (usuarioId) => __awaiter(void 0, void 0, void 0, function* () {
    // Implementa la lógica para inicializar el perfil de usuario si es necesario
});
//Se puede reutilizar:Para que 
/**
 * Genera y guarda un código de verificación en la base de datos.
 * @param usuarioId ID del usuario.
 * @param email Dirección de correo electrónico.
 * @returns El código de verificación generado.
 */
const generateAndSaveVerificationCode = (usuarioId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationCode = (0, generateCode_1.generateVerificationCode)();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    // Crea una entrada de verificación en la base de datos
    yield verificationsModel_1.Verificacion.create({
        usuario_id: usuarioId,
        verificado: false,
        correo_verificado: false,
        codigo_verificacion: verificationCode,
        expiracion_codigo_verificacion: expirationDate,
    });
    return verificationCode;
});
//Se puede reutilizar:Para que 
/**
 * Obtiene un mensaje relacionado con el rol del usuario.
 * @param rol Rol del usuario.
 * @returns Mensaje relacionado con el rol.
 */
const getRoleMessage = (rol) => {
    return rol === 'admin' ? 'administrador' : rol === 'user' ? 'normal' : '';
};
