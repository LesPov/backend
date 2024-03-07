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
const BLOCK_DURATION_MINUTES = 3;
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
    const currentLoginAttempts = user.verificacion.intentos_ingreso || 0;
    const updatedLoginAttempts = currentLoginAttempts >= MAX_LOGIN_ATTEMPTS ? MAX_LOGIN_ATTEMPTS : currentLoginAttempts + 1;

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

    // Obtener el número actualizado de intentos de inicio de sesión desde la base de datos
    const updatedUser = await findUserByUserName(user.usuario);

    // Maneja el bloqueo de la cuenta si es necesario
    await handleMaxLoginAttempts(updatedUser, res);

    // Envía un mensaje de error al cliente
    res.status(400).json({
        msg: errorMessages.incorrectPassword(updatedUser.verificacion.intentos_ingreso),
    });
};

//////////////////////////////////////////////////////////////////////////////////////

/**
 * Bloquea la cuenta del usuario después de varios intentos fallidos de inicio de sesión.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se bloqueará.
 * @returns {Promise<void>} - Resuelve después de bloquear la cuenta del usuario si se encuentra en la base de datos.
 */
const lockAccount = async (usuario: any) => {
    try {
        const user = await findUserAndBlockAccount(usuario);
        if (user) {
            await handleAccountLock(user);
        }
    } catch (error) {
        handleLockAccountError(error);
    }
};

const findUserAndBlockAccount = async (usuario: string) => {
    const user = await findUserByUserName(usuario);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const expirationDate = calculateBlockExpirationDate();
    await updateVerificationTable(user, expirationDate);
    return user;
};

const handleAccountLock = async (user: any) => {
    const expirationDate = calculateBlockExpirationDate();
    await updateVerificationTable(user, expirationDate);
};

const handleLockAccountError = (error: any) => {
    console.error('Error al bloquear la cuenta:', error);
};


/**
 * Encuentra a un usuario por nombre de usuario e incluye información de verificación.
 * @param {string} usuario - El nombre de usuario del usuario a buscar.
 * @returns {Promise<any>} - Resuelve con el objeto de usuario si se encuentra, de lo contrario, null.
 */
const findUserByUserName = async (usuario: string): Promise<any | null> => {
    const user = await Usuario.findOne({
        where: { usuario: usuario },
        include: [Verificacion],
    });
    return user || null;
};

/**
 * Calcula la fecha de vencimiento para el bloqueo de la cuenta.
 * @returns {Date} - La fecha de vencimiento calculada.
 */
const calculateBlockExpirationDate = () => {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
};

/**
 * Actualiza la tabla de verificación para reflejar el bloqueo de la cuenta.
 * @param {any} user - El objeto de usuario.
 * @param {Date} expirationDate - La fecha de vencimiento para el bloqueo de la cuenta.
 * @returns {Promise<void>} - Resuelve después de actualizar la tabla de verificación.
 */
const updateVerificationTable = async (user:any, expirationDate:Date) => {
    await Verificacion.update(
        {
            intentos_ingreso: MAX_LOGIN_ATTEMPTS,
            expiracion_intentos_ingreso: expirationDate,
        },
        { where: { usuario_id: user.usuario_id } }
    );
};

////////////////////////////////////////////////////////////////////
/**
 * Verifica si la cuenta del usuario está bloqueada debido a intentos fallidos de inicio de sesión.
 * @param user Usuario encontrado.
 * @returns true si la cuenta está bloqueada, false si no lo está.
 */
const isAccountBlocked = (user: any): boolean => {
    return user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS;
};

/**
 * Verifica si la cuenta está bloqueada temporalmente y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleTemporaryLock = (user: any, res: Response): void => {
    const currentDate = new Date();
    const expirationDate = user.verificacion.expiracion_intentos_ingreso;

    if (expirationDate && expirationDate > currentDate) {
        const timeLeft = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (60 * 1000));
        res.status(400).json({
            msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
        });
    } else {
        unlockAccount(user.usuario);
    }
};

/**
 * Verifica si la cuenta está bloqueada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleAccountBlock = (user: any, res: Response): void => {
    if (isAccountBlocked(user)) {
        handleTemporaryLock(user, res);
    }
};

/**
 * Verifica si la cuenta está bloqueada según la nueva lógica proporcionada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleNewAccountBlockLogic = (user: any, res: Response): void => {
    const currentDate = new Date();
    const blockExpiration = user.verificacion.blockExpiration;

    if (blockExpiration && blockExpiration > currentDate) {
        const timeLeft = Math.ceil((blockExpiration.getTime() - currentDate.getTime()) / (60 * 1000));
        res.status(400).json({
            msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
        });
    }
};

/**
 * Verifica el estado de bloqueo de la cuenta y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkLoginAttemptsAndBlockAccount = async (user: any, res: Response): Promise<void> => {
    checkAndHandleAccountBlock(user, res);
    checkAndHandleNewAccountBlockLogic(user, res);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Desbloquear la cuenta de un usuario en base a su nombre de usuario.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se desbloqueará.
 * @returns {Promise<void>} No devuelve ningún valor explícito, pero desbloquea la cuenta del usuario si es encontrado en la base de datos.
 */
export const unlockAccount = async (usuario: any): Promise<void> => {
    try {
        const user = await findUserAndLoadVerificationInfo(usuario);

        if (user) {
            await resetFailedLoginAttempts(user);
        }
    } catch (error) {
        handleUnlockAccountError(error);
    }
};

const findUserAndLoadVerificationInfo = async (usuario: string): Promise<any | null> => {
    const user = await findUserByUserName(usuario);
    return user || null;
};

const resetFailedLoginAttempts = async (user: any): Promise<void> => {
    await Verificacion.update(
        { intentos_ingreso: 0 },
        { where: { usuario_id: user.usuario_id } }
    );
};

const handleUnlockAccountError = (error: any) => {
    console.error('Error al desbloquear la cuenta:', error);
};

///////////////////////////////////////////////////////////////////////////////////
export const generateAuthToken = (user: any) => {
    // Obtener los roles del usuario
    const roles = getUserRoles(user);

    // Crear el payload del token
    const payload = createTokenPayload(user, roles);

    // Firmar el token
    return signToken(payload);
};

// Obtener los roles del usuario
const getUserRoles = (user: any) => {
    return Array.isArray(user?.rols) ? user.rols.map((rol: any) => rol.nombre) : [];
};

// Crear el payload del token
const createTokenPayload = (user: any, roles: string[]) => {
    return {
        usuario: user.usuario,
        usuario_id: user.usuario_id,
        rol: roles.length > 0 ? roles[0] : null, // Tomar el primer rol si existe, o null si no hay roles
    };
};

// Firmar el token
const signToken = (payload: any) => {
    return jwt.sign(payload, process.env.SECRET_KEY || 'pepito123');
};

/////////////////////////////////////////////////////////////////////////////////////////

export const handleSuccessfulLogin = async (user: any, res: Response, contrasena: string) => {
    const msg = getMessage(contrasena);
    const token = generateAuthToken(user);
    const { userId, rol } = getUserInfo(user);

    return res.json({ msg, token, userId, rol, passwordorrandomPassword: getPasswordOrRandomPassword(user, contrasena) });
};

const getMessage = (contrasena: string): string => {
    return contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages.userLoggedIn;
};

const getUserInfo = (user: any): { userId: string, rol: string | null } => {
    const userId = user.usuario_id;
    const rol = Array.isArray(user.rols) && user.rols.length > 0 ? user.rols[0].nombre : null;
    return { userId, rol };
};


const getPasswordOrRandomPassword = (user: any, contrasena: string): string | undefined => {
    return contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
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
