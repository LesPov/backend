import Verificacion from "../../../../models/verificaciones/verificationsModel";
import { findUserByUserName } from "../lockAccount/lockAccount";

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