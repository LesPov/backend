import { errorMessages } from "../../../../middleware/errorMessages";
import Rol from "../../../../models/rol/rolModel";
import Usuario, { UsuarioModel } from "../../../../models/usuarios/usuariosModel";
import Verificacion from "../../../../models/verificaciones/verificationsModel";
import { Request, Response } from 'express';



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
