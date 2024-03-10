import Usuario from "../../../../models/usuarios/usuariosModel";
import Verificacion from "../../../../models/verificaciones/verificationsModel";

// Máximo de intentos de inicio de sesión permitidos
const BLOCK_DURATION_MINUTES = 3;
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Bloquea la cuenta del usuario después de varios intentos fallidos de inicio de sesión.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se bloqueará.
 * @returns {Promise<void>} - Resuelve después de bloquear la cuenta del usuario si se encuentra en la base de datos.
 */
export const lockAccount = async (usuario: any) => {
    try {
        const user = await findUserAndBlockAccount(usuario);
        if (user) {
            await handleAccountLock(user);
        }
    } catch (error) {
        handleLockAccountError(error);
    }
};

export const findUserAndBlockAccount = async (usuario: string) => {
    const user = await findUserByUserName(usuario);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const expirationDate = calculateBlockExpirationDate();
    await updateVerificationTable(user, expirationDate);
    return user;
};

export const handleAccountLock = async (user: any) => {
    const expirationDate = calculateBlockExpirationDate();
    await updateVerificationTable(user, expirationDate);
};

export const handleLockAccountError = (error: any) => {
    console.error('Error al bloquear la cuenta:', error);
};


/**
 * Encuentra a un usuario por nombre de usuario e incluye información de verificación.
 * @param {string} usuario - El nombre de usuario del usuario a buscar.
 * @returns {Promise<any>} - Resuelve con el objeto de usuario si se encuentra, de lo contrario, null.
 */
export const findUserByUserName = async (usuario: string): Promise<any | null> => {
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
export const calculateBlockExpirationDate = () => {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
};

/**
 * Actualiza la tabla de verificación para reflejar el bloqueo de la cuenta.
 * @param {any} user - El objeto de usuario.
 * @param {Date} expirationDate - La fecha de vencimiento para el bloqueo de la cuenta.
 * @returns {Promise<void>} - Resuelve después de actualizar la tabla de verificación.
 */
export const updateVerificationTable = async (user:any, expirationDate:Date) => {
    await Verificacion.update(
        {
            intentos_ingreso: MAX_LOGIN_ATTEMPTS,
            expiracion_intentos_ingreso: expirationDate,
        },
        { where: { usuario_id: user.usuario_id } }
    );
};
