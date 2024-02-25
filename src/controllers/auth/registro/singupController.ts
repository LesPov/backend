import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from '../../../models/usuarios/usuariosModel';
import { Rol } from '../../../models/rol/rolModel';
import { UsuarioRol } from '../../../models/usuarios_rols/usuariosRolModel';
import { Verificacion } from '../../../models/verificaciones/verificationsModel';
import { sendVerificationEmail } from '../../../utils/emailUtils';
import { generateVerificationCode } from '../../../utils/generateCode';
import { errorMessages } from '../../../middleware/errorMesages';
import { successMessages } from '../../../middleware/successMessages';


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
export const newUser = async (req: Request, res: Response) => {
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
        const existingUserError = await checkExistingUser(usuario, email);
        handleExistingUserError(existingUserError, res);

        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Crear un nuevo usuario en la base de datos
        const newUser = await createNewUser(usuario, hashedPassword, email, rol);

        // Inicializar el perfil de usuario si es necesario
        await initializeUserProfile(newUser.usuario_id);

        // Generar y guardar un código de verificación
        const verificationCode = await generateAndSaveVerificationCode(newUser.usuario_id, email);

        // Enviar un correo electrónico de verificación
        await sendVerificationEmail(email, usuario, verificationCode);

        // Obtener el mensaje de éxito según el rol del usuario
        const userMessage = getRoleMessage(rol);

        // Responder con un mensaje de éxito
        res.json({
            msg: successMessages.userRegistered(usuario, userMessage),
        });
    } catch (error) {
        // Manejar errores internos del servidor
        handleServerError(error, res);
    }
};

//Se puede reutilizar:Para que 
/**
 * Valida que los campos de entrada no estén vacíos.
 * @param usuario Nombre de usuario.
 * @param contrasena Contraseña.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 */
const validateInput = (usuario: string, contrasena: string, email: string, rol: string): string[] => {
    const errors: string[] = [];
    if (!usuario) {
        errors.push(errorMessages.requiredFields);
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
const handlePasswordValidationErrors = (errors: string[], res: Response) => {
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
const handleExistingUserError = (error: string | null, res: Response) => {
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
const handleServerError = (error: any, res: Response) => {
    console.error("Error en el controlador newUser:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: errorMessages.databaseError,
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
const validatePasswordRequirements = (contrasena: string): string[] => {
    const errors: string[] = [];

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
const validateLength = (contrasena: string, errors: string[]) => {
    if (contrasena.length < PASSWORD_MIN_LENGTH) {
        errors.push(errorMessages.passwordTooShort);
    }
};

//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña contiene al menos un número.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateNumber = (contrasena: string, errors: string[]) => {
    if (!PASSWORD_REGEX_NUMBER.test(contrasena)) {
        errors.push(errorMessages.passwordNoNumber);
    }
};

//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña contiene al menos una letra mayúscula.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateUppercase = (contrasena: string, errors: string[]) => {
    if (!PASSWORD_REGEX_UPPERCASE.test(contrasena)) {
        errors.push(errorMessages.passwordNoUppercase);
    }
};

//Se puede reutilizar:Para que 
/**
 * Valida si la contraseña contiene al menos una letra minúscula.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateLowercase = (contrasena: string, errors: string[]) => {
    if (!PASSWORD_REGEX_LOWERCASE.test(contrasena)) {
        errors.push(errorMessages.passwordNoLowercase);
    }
};

//Se puede reutilizar:Para que 
/**
 * Valida el formato del correo electrónico.
 * @param email El correo electrónico a validar.
 */
const validateEmail = (email: string) => {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error(errorMessages.invalidEmail);
    }
};

//Se puede reutilizar:Para que 
/**
 * Verifica si un usuario o correo electrónico ya existe.
 * @param usuario Nombre de usuario.
 * @param email Dirección de correo electrónico.
 * @returns Mensaje de error si el usuario o correo electrónico ya existe, de lo contrario, null.
 */
const checkExistingUser = async (usuario: string, email: string): Promise<string | null> => {
    return (
        (await checkExistingUsername(usuario)) ||
        (await checkExistingEmail(email)) ||
        null
    );
};

//Se puede reutilizar:Para que 
/**
 * Verifica si un nombre de usuario ya existe.
 * @param usuario Nombre de usuario a verificar.
 * @returns Mensaje de error si el nombre de usuario ya existe, de lo contrario, null.
 */
const checkExistingUsername = async (usuario: string): Promise<string | null> => {
    return (await findExistingUsername(usuario))
        ? errorMessages.userExists(usuario)
        : null;
};

//Se puede reutilizar:Para que 
/**
 * Verifica si una dirección de correo electrónico ya existe.
 * @param email Dirección de correo electrónico a verificar.
 * @returns Mensaje de error si la dirección de correo electrónico ya existe, de lo contrario, null.
 */
const checkExistingEmail = async (email: string): Promise<string | null> => {
    return (await findExistingEmail(email))
        ? errorMessages.userEmailExists(email)
        : null;
};

/**
 * Busca si un nombre de usuario ya existe en la base de datos.
 * @param usuario Nombre de usuario a buscar.
 * @returns True si el nombre de usuario existe, de lo contrario, false.
 */
const findExistingUsername = async (usuario: string): Promise<boolean> => {
    try {
        const existingUsuario = await Usuario.findOne({ where: { usuario } });
        return Boolean(existingUsuario);
    } catch (error) {
        console.error("Error en findExistingUsername:", error);
        throw errorMessages.databaseError;
    }
};

/**
 * Busca si una dirección de correo electrónico ya existe en la base de datos.
 * @param email Dirección de correo electrónico a buscar.
 * @returns True si la dirección de correo electrónico existe, de lo contrario, false.
 */
const findExistingEmail = async (email: string): Promise<boolean> => {
    try {
        const existingEmail = await Usuario.findOne({ where: { email } });
        return Boolean(existingEmail);
    } catch (error) {
        console.error("Error en findExistingEmail:", error);
        throw errorMessages.databaseError;
    }
};

//Se puede reutilizar:Para que 
/**
 * Crea un nuevo usuario en la base de datos.
 * @param usuario Nombre de usuario.
 * @param hashedPassword Contraseña con hash.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 * @returns El nuevo usuario creado.
 */
const createNewUser = async (usuario: string, hashedPassword: string, email: string, rol: string) => {
    try {
        const nuevoUsuario = await Usuario.create({
            usuario: usuario,
            contrasena: hashedPassword,
            email: email,
        });

        // Asigna el rol al usuario
        await assignUserRole(nuevoUsuario.usuario_id, rol);

        return nuevoUsuario;
    } catch (error) {
        console.error("Error en createNewUser:", error);
        throw errorMessages.databaseError;
    }
};

/**
 * Asigna un rol a un usuario en la base de datos.
 * @param usuarioId ID del usuario.
 * @param rol Rol a asignar.
 */
const assignUserRole = async (usuarioId: number, rol: string) => {
    try {
        // Busca el rol en la base de datos
        const selectedRol = await Rol.findOne({ where: { nombre: rol } });

        if (!selectedRol) {
            throw new Error(errorMessages.invalidRole);
        }

        // Asigna el rol al usuario
        await UsuarioRol.create({
            usuario_id: usuarioId,
            rol_id: selectedRol.rol_id,
        });
    } catch (error) {
        console.error("Error en assignUserRole:", error);
        throw errorMessages.databaseError;
    }
};

//Se puede reutilizar:Para que 
/**
 * Inicializa el perfil de usuario si es necesario.
 * @param usuarioId ID del usuario.
 */
const initializeUserProfile = async (usuarioId: number) => {
    // Implementa la lógica para inicializar el perfil de usuario si es necesario
};

//Se puede reutilizar:Para que 
/**
 * Genera y guarda un código de verificación en la base de datos.
 * @param usuarioId ID del usuario.
 * @param email Dirección de correo electrónico.
 * @returns El código de verificación generado.
 */
const generateAndSaveVerificationCode = async (usuarioId: number, email: string) => {
    const verificationCode = generateVerificationCode();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);

    // Crea una entrada de verificación en la base de datos
    await Verificacion.create({
        usuario_id: usuarioId,
        verificado: false,
        correo_verificado: false,
        codigo_verificacion: verificationCode,
        expiracion_codigo_verificacion: expirationDate,
    });

    return verificationCode;
};

//Se puede reutilizar:Para que 
/**
 * Obtiene un mensaje relacionado con el rol del usuario.
 * @param rol Rol del usuario.
 * @returns Mensaje relacionado con el rol.
 */
const getRoleMessage = (rol: string) => {
    return rol === 'admin' ? 'administrador' : rol === 'user' ? 'normal' : '';
};
