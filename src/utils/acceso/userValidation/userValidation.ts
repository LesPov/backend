import { errorMessages } from "../../../middleware/errorMessages";
import Rol from "../../../models/rol/rolModel";
import Usuario from "../../../models/usuarios/usuariosModel";
import Verificacion from "../../../models/verificaciones/verificationsModel";
import { Request, Response } from 'express';

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
