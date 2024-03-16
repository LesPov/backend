import { Request, Response } from 'express';
import { handleServerErrorLogin } from '../../../utils/acceso/login/userValidation/userValidation';
import { errorMessages } from '../../../middleware/errorMessages';
import { handleInputValidationErrors } from '../../../utils/singup/validation/validationUtils';
import Usuario, { UsuarioModel } from '../../../models/usuarios/usuariosModel';
import Verificacion from '../../../models/verificaciones/verificationsModel';
import Rol from '../../../models/rol/rolModel';
import bcrypt from 'bcryptjs';
import { handleSuccessfulLogin } from '../../../utils/acceso/login/handleSuccessfulLogin/handleSuccessfulLogin';



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param contraseña  Contraseña proporcionada.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
export const validateVerificationFieldslogin = (usernameOrEmail: string, contrasena: string): string[] => {
    const errors: string[] = [];

    if (!usernameOrEmail || !contrasena) {
        errors.push(errorMessages.missingUsernameOrEmail);
    } else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages.invalidEmail);
    }

 
    return errors;
};

/**
 * Verifica la contraseña del usuario.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const verifyUserPassworde = async (
    passwordOrRandomPassword: string,
    user: any,
    res: Response
): Promise<void> => {
    try {
        // Verifica si la contraseña es válida
        const passwordValid = await isPasswordValid(passwordOrRandomPassword, user);
        if (!passwordValid) {
            // Si la contraseña no es válida, devuelve un error de contraseña incorrecta
             res.status(401).json({ msg: "Contraseña incorrecta" });
        }
        // Si la contraseña es válida, continúa con el proceso de inicio de sesión
        // Aquí puedes agregar el código necesario para iniciar sesión correctamente
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        // Maneja el error si ocurre durante la verificación de la contraseña
         res.status(500).json({ msg: "Error interno del servidor" });
    }
};


/**
 * Verifica si la contraseña proporcionada es válida.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns True si la contraseña es válida, false en caso contrario.
 */
const isPasswordValid = async (passwordOrRandomPassword: string, user: any): Promise<boolean> => {
    // Verifica si la longitud de la contraseña es igual a 8 para determinar si es una contraseña aleatoria
    return passwordOrRandomPassword.length === 8
        ? verifyRandomPassword(passwordOrRandomPassword, user)
        : await verifyBcryptPassword(passwordOrRandomPassword, user.contrasena);
};
/**
 * Verifica la contraseña aleatoria del usuario.
 * @param randomPassword Contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria es válida, false en caso contrario.
 */
const verifyRandomPassword = (randomPassword: string, user: any): boolean => {
    console.log('Contraseña aleatoria.');
    return randomPassword === user.verificacion.contrasena_aleatoria;
};

/**
 * Verifica la contraseña normal.
 * @param password Contraseña proporcionada.
 * @param contrasena Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    console.log('Contraseña normal.');
    return await bcrypt.compare(password, hashedPassword);
};
/**
 * Buscar un usuario por nombre de usuari o email  incluyendo su información de verificación y rol.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
export const findUserByUsernameLogin = async (usernameOrEmail: string, res: Response): Promise<UsuarioModel> => {
    let user: UsuarioModel | null = null;

    if (EMAIL_REGEX.test(usernameOrEmail)) {
        user = await Usuario.findOne({
            where: { email: usernameOrEmail },
            include: [Verificacion, Rol],
        });
    } else {
        user = await Usuario.findOne({
            where: { usuario: usernameOrEmail },
            include: [Verificacion, Rol],
        });
    }

    if (!user) {
        res.status(400).json({ msg: errorMessages.userNotExists(usernameOrEmail) });
        throw new Error("Usuario no encontrado");
    }

    return user;
};

/**
 * Verifica si el correo electrónico del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkEmailVerification = (user: any, res: Response) => {
    if (!user.verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMessages.userNotVerified,
        });
    }
};

/**
 * Verifica si el teléfono del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkPhoneVerification = (user: any, res: Response) => {
    if (!user.verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMessages.phoneVerificationRequired,
        });
    }
};

/**
 * Verifica si esta  usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkVerificationverificado = (user: any, res: Response) => {
    if (!user.verificacion.verificado) {
        return res.status(400).json({
            msg: errorMessages.verificadoVericationRequired,
        });
    }
};
/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkUserVerificationStatusLogin = (user: any, res: Response) => {
    checkEmailVerification(user, res);
    checkPhoneVerification(user, res);
    checkVerificationverificado(user, res);

};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { usernameOrEmail, contrasena } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldslogin(
            usernameOrEmail,
            contrasena);
        handleInputValidationErrors(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameLogin(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);

        // Verificar la contraseña del usuario
        await verifyUserPassworde(contrasena, user, res);

        await handleSuccessfulLogin(user, res, contrasena);
    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrorLogin(error, res);
    }
};

