import { errorMessages } from "../../../../../middleware/errorMesages";
import Usuario from "../../../../../models/usuarios/usuariosModel";
import { Request, Response } from 'express';
import { handleInputValidationErrors } from "../../../../../utils/singup/validation/validationUtils";
import Verificacion from "../../../../../models/verificaciones/verificationsModel";

/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsPhoneSend = (usuario: string, celular: string): string[] => {
    const errors: string[] = [];
    if (!usuario || !celular) {
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
const findUserByUsernamePhoneSend = async (usuario: string, res: Response) => {
    const user = await Usuario.findOne({ where: { usuario: usuario }, include: [Verificacion] });

    if (!user) {
        return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
    }
    return user;
};

/**
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
const checkUserVerificationStatusPhoneSend = (user: any) => {
    if (isUserAlreadyVerifiedPhoneSend(user)) {
        throw new Error(errorMessages.userAlreadyVerified);
    }
};

/**
 * Verificar si el usuario ya ha sido verificado en las tablas verifcado o correo_verifcado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
const isUserAlreadyVerifiedPhoneSend = (user: any) => {
    return user.verificacion.verificado || user.verificacion.correo_verificado;
};

/**
 * Verificar la disponibilidad del número de teléfono en la base de datos.
 * @param celular Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 */
const checkPhoneNumberAvailability = async (celular: string, res: Response) => {
    try {
        const existingUser = await Usuario.findOne({ where: { celular: celular } });

        if (existingUser) {
            return res.status(400).json({
                msg: errorMessages.phoneNumberExists,
            });
        }
    } catch (error) {
        handleServerErrorPhoneSend(error, res);
    }
};

/**
 * Verificar si el número de teléfono ya está asociado al usuario actual.
 * @param user Usuario actual.
 * @param celular Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 */
const checkUserPhoneNumberExists = (user: any, celular: string, res: Response) => {
    if (user.celular === celular) {
        return res.status(400).json({
            msg: errorMessages.phoneNumberInUse,
        });
    }
};

/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
export const sendVerificationCode = async (req: Request, res: Response) => {
    try {
        const { usuario, celular } = req.body;

        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernamePhoneSend(usuario, res);

        // Verificar estado de verificación del usuario
        checkUserVerificationStatusPhoneSend(user);

        // Verificar si el usuario ya tiene un número de teléfono asociado
        checkUserPhoneNumberExists(user, celular, res);

        // Verificar si el teléfono ya está verificado
        await checkPhoneNumberAvailability(celular, res);

        // Resto de la lógica para enviar el código de verificación por SMS

    } catch (error: any) {
        handleServerErrorPhoneSend(error, res);
    }
};

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrorPhoneSend = (error: any, res: Response) => {
    console.error("Error en el controlador phonesend:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
