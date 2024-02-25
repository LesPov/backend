import { Response } from 'express';
import { errorMessages } from '../../middleware/errorMesages';
import Usuario from '../../models/usuarios/usuariosModel';

/**
 * Maneja los errores relacionados con la existencia de un usuario.
 * @param error Mensaje de error si el usuario ya existe, de lo contrario, null.
 * @param res La respuesta HTTP saliente.
 */
export const handleExistingUserError = (error: string | null, res: Response) => {
    if (error) {
        res.status(400).json({
            msg: error,
        });
    }
};

/**
 * Verifica si un usuario o correo electrónico ya existe.
 * @param usuario Nombre de usuario.
 * @param email Dirección de correo electrónico.
 * @returns Mensaje de error si el usuario o correo electrónico ya existe, de lo contrario, null.
 */
export const checkExistingUser = async (usuario: string, email: string): Promise<string | null> => {
    return (
        (await checkExistingUsername(usuario)) ||
        (await checkExistingEmail(email)) ||
        null
    );
};

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