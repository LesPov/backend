import { errorMessages } from "../../../../../middleware/errorMessages";
import Rol from "../../../../../models/rol/rolModel";
import Usuario, { UsuarioModel } from "../../../../../models/usuarios/usuariosModel";
import Verificacion from "../../../../../models/verificaciones/verificationsModel";
import { Request, Response } from 'express';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Buscar un usuario por nombre de usuari o email  incluyendo su información de verificación y rol.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
export const findUserByUsernameRecoveryPass = async (usernameOrEmail: string, res: Response): Promise<UsuarioModel> => {
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
 * Función que busca un registro de verificación para un usuario en la base de datos.
 * Si no existe, crea uno nuevo.
 * @param usuario_id - ID del usuario.
 * @returns Registro de verificación.
 */
export const findOrCreateVerificationRecoveryPass= async (usuario_id: number) => {
    let verificationRecord = await Verificacion.findOne({ where: { usuario_id } });

    if (!verificationRecord) {
        verificationRecord = await Verificacion.create({ usuario_id });
    }

    return verificationRecord;
};
