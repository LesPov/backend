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
const successMessages_1 = require("../../../middleware/successMessages");
const databaseUtils_1 = require("../../../utils/singup/database/databaseUtils");
const emailUtils_1 = require("../../../utils/singup/emailsend/emailUtils");
const existingUserUtils_1 = require("../../../utils/singup/existingUser/existingUserUtils");
const roleUtils_1 = require("../../../utils/singup/role/roleUtils");
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
/**
 * Controlador para registrar un nuevo usuario.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
const newUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, contrasena, email, rol } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, validationUtils_1.validateInput)(usuario, contrasena, email, rol);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Validar los requisitos de la contraseña
        const passwordValidationErrors = (0, validationUtils_1.validatePassword)(contrasena);
        (0, validationUtils_1.handlePasswordValidationErrors)(passwordValidationErrors, res);
        // Validar el formato del correo electrónico
        (0, validationUtils_1.validateEmail)(email);
        // Verificar si el usuario o el correo electrónico ya existen
        const existingUserError = yield (0, existingUserUtils_1.checkExistingUser)(usuario, email);
        (0, existingUserUtils_1.handleExistingUserError)(existingUserError, res);
        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = yield bcryptjs_1.default.hash(contrasena, 10);
        // Crear un nuevo usuario en la base de datos
        const newUser = yield (0, databaseUtils_1.createNewUserWithRole)(usuario, hashedPassword, email, rol);
        // Inicializar el perfil de usuario si es necesario
        yield (0, databaseUtils_1.initializeUserProfile)(newUser.usuario_id);
        // Generar y guardar un código de verificación
        const verificationCode = yield (0, databaseUtils_1.generateAndSaveVerificationCode)(newUser.usuario_id, email);
        // Enviar un correo electrónico de verificación
        yield (0, emailUtils_1.sendVerificationEmail)(email, usuario, verificationCode);
        // Obtener el mensaje de éxito según el rol del usuario
        const userMessage = (0, roleUtils_1.getRoleMessage)(rol);
        // Responder con un mensaje de éxito
        res.json({
            msg: successMessages_1.successMessages.userRegistered(usuario, userMessage),
        });
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, databaseUtils_1.handleServerError)(error, res);
    }
});
exports.newUser = newUser;
