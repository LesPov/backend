import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { successMessages } from '../../../middleware/successMessages';

import { handleInputValidationErrors } from '../../../utils/singup/validation/validationUtils';
import { errorMessages } from '../../../middleware/errorMesages';
import Usuario from '../../../models/usuarios/usuariosModel';
import Verificacion from '../../../models/verificaciones/verificationsModel';
import jwt from 'jsonwebtoken';
import Rol from '../../../models/rol/rolModel';

// Máximo de intentos de inicio de sesión permitidos
const MAX_LOGIN_ATTEMPTS = 5;


/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
export const validateVerificationFieldsLogin = (usuario: string, contrasena_aleatoria: string): string[] => {
    const errors: string[] = [];
    if (!usuario || !contrasena_aleatoria) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};
/**
 * Buscar un usuario por nombre de usuario, incluyendo su información de verificación.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
export const findUserByUsernameLogin = async (usuario: string, res: Response) => {
    const user = await Usuario.findOne({
        where: { usuario: usuario },
        include: [
            {
                model: Verificacion, // Incluye la relación Verificacion
            },
            {
                model: Rol, // Incluye la relación con el modelo de rol
            },
        ],
    });

    if (!user) {
        return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
    }
    return user;
};


///////////////////////////////////////////////////////////////////////////
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
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkUserVerificationStatusLogin = (user: any, res: Response) => {
    checkEmailVerification(user, res);
    checkPhoneVerification(user, res);
};
/////////////////////////////////////////////////////////////////////////


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
 * Verifica la contraseña utilizando bcrypt.
 * @param password Contraseña proporcionada.
 * @param hashedPassword Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    console.log('Contraseña normal.');
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Actualiza el número de intentos de inicio de sesión en la tabla de Verificacion.
 * @param user Usuario encontrado.
 */
const updateLoginAttempts = async (user: any): Promise<void> => {
    const updatedLoginAttempts = (user.verificacion.intentos_ingreso || 0) + 1;

    await Verificacion.update(
        { intentos_ingreso: updatedLoginAttempts },
        { where: { usuario_id: user.usuario_id } }
    );
};

/**
 * Bloquea la cuenta si se excede el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleMaxLoginAttempts = async (user: any, res: Response): Promise<void> => {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        await lockAccount(user.usuario);
        res.status(400).json({
            msg: errorMessages.accountLocked,
        });
    }
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
            // Maneja el inicio de sesión fallido
            await handleFailedLogin(user, res);
        }
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
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
 * Maneja un intento fallido de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleFailedLogin = async (user: any, res: Response): Promise<void> => {
    // Actualiza el número de intentos de inicio de sesión
    await updateLoginAttempts(user);
    
    // Maneja el bloqueo de la cuenta si es necesario
    await handleMaxLoginAttempts(user, res);

    // Envía un mensaje de error al cliente
    res.status(400).json({

        msg: errorMessages.incorrectPassword(user.verificacion.intentos_ingreso),
    });
};

//////////////////////////////////////////////////////////////////////////////////////

/**
 * Bloquea la cuenta de un usuario después de múltiples intentos fallidos de inicio de sesión.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se bloqueará.
 * @returns {Promise<void>} No devuelve ningún valor explícito, pero bloquea la cuenta del usuario si es encontrado en la base de datos.
 */
async function lockAccount(usuario: any) {
    try {
        // Buscar al usuario en la base de datos por su nombre de usuario y cargar información de verificación asociada.
        const user = await Usuario.findOne({
            where: { usuario: usuario },
            include: [Verificacion],
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
        await Promise.all([

            Verificacion.update(
                {
                    intentos_ingreso: MAX_LOGIN_ATTEMPTS,
                    expiracion_intentos_ingreso: expirationDate  // Actualiza la fecha de expiración de bloqueo
                },
                { where: { usuario_id: user.usuario_id } }
            ),
        ]);
    } catch (error) {
        console.error('Error al bloquear la cuenta:', error);
    }
}
/**
 * Verifica si el usuario ha excedido el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkLoginAttemptsAndBlockAccount = async (user: any, res: Response) => {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        const currentDate = new Date();

        // Verificar si la cuenta está bloqueada y si el bloqueo aún no ha expirado
        if (user.verificacion.expiracion_intentos_ingreso && user.verificacion.expiracion_intentos_ingreso > currentDate) {
            const timeLeft = Math.ceil((user.verificacion.expiracion_intentos_ingreso.getTime() - currentDate.getTime()) / (60 * 1000));

            return res.status(400).json({
                msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
            });
        } else {
            // Desbloquear la cuenta nuevamente si el bloqueo ha expirado
            await unlockAccount(user.usuario);
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
};


/**
 * Desbloquear la cuenta de un usuario en base a su nombre de usuario.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se desbloqueará.
 * @returns {Promise<void>} No devuelve ningún valor explícito, pero desbloquea la cuenta del usuario si es encontrado en la base de datos.
 */
async function unlockAccount(usuario: any) {
    try {
        // Buscar al usuario en la base de datos por su nombre de usuario y cargar información de verificación asociada.
        const user = await Usuario.findOne({
            where: { usuario: usuario },
            include: [Verificacion],
        });

        // Verificar si el usuario existe en la base de datos.
        if (!user) {
            console.error('Usuario no encontrado');
            return;
        }

        // Restablecer el número de intentos de inicio de sesión fallidos a cero en la tabla Verification.
        await Promise.all([
            Verificacion.update(
                { intentos_ingreso: 0 },
                { where: { usuario_id: user.usuario_id } }
            ),
        ]);
    } catch (error) {
        console.error('Error al desbloquear la cuenta:', error);
    }
}
///////////////////////////////////////////////////////////////////////////////////
export const generateAuthToken = (user: any) => {
    // Asegúrate de que la propiedad 'roles' esté presente y sea un array
    const roles = Array.isArray(user?.rols) ? user.rols.map((rol: any) => rol.nombre) : [];

    return jwt.sign({
        usuario: user.usuario,
        usuario_id: user.usuario_id,
        rol: roles.length > 0 ? roles[0] : null, // Tomar el primer rol si existe, o null si no hay roles
    }, process.env.SECRET_KEY || 'pepito123');
};



export const handleSuccessfulLogin = async (user: any, res: Response, contrasena: string) => {
    const msg = contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages.userLoggedIn;
    const token = generateAuthToken(user);
    const userId = user.usuario_id;
    const roles = Array.isArray(user.rols) ? user.rols.map((rol: any) => rol.nombre) : [];
    const rol = roles.length > 0 ? roles[0] : null; // Tomar el primer rol si existe, o null si no hay roles
    const passwordorrandomPassword = contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
    console.log('Tipo de contraseña:', passwordorrandomPassword);

    return res.json({ msg, token, userId, rol, passwordorrandomPassword });
};

////////////////////////////////////////////////////////////////////
/**
 * Controlador para inicar sesion.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { usuario, contrasena_aleatoria } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldsLogin(usuario, contrasena_aleatoria);

        handleInputValidationErrors(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameLogin(usuario, res);

        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);

        // Verificar la contraseña del usuario
        await verifyUserPassworde(contrasena_aleatoria, user, res);

        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        await checkLoginAttemptsAndBlockAccount(user, res);


        await handleSuccessfulLogin(user, res, contrasena_aleatoria);


    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrorLogin(error, res);
    }
};

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrorLogin = (error: any, res: Response) => {
    console.error("Error en el controlador login:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
