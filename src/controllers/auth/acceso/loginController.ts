import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { successMessages } from '../../../middleware/successMessages';

import { handleInputValidationErrors } from '../../../utils/singup/validation/validationUtils';
import { errorMessages } from '../../../middleware/errorMesages';
import Usuario from '../../../models/usuarios/usuariosModel';
import Verificacion from '../../../models/verificaciones/verificationsModel';


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
        include: [Verificacion], // Asegúrate de incluir la relación Verificacion
    });

    if (!user) {
        return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
    }
    return user;
};


/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkUserVerificationStatusLogin = (user: any, res: Response) => {
    // Verificar si el correo electrónico del usuario está verificado
    if (!user.Verificacion || !user.Verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMessages.userNotVerified,
        });
    }

    // Verificar si el teléfono del usuario está verificado
    if (!user.Verificacion || !user.Verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMessages.phoneVerificationRequired,
        });
    }
};



/**
 * Controlador para registrar un nuevo usuario.
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

        // Responder con un mensaje de éxito
        res.json({
            msg: successMessages.userLoggedIn
        });
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
