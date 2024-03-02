import { errorMessages } from "../../../../../middleware/errorMesages";
import Usuario from "../../../../../models/usuarios/usuariosModel";
import { Request, Response } from 'express';
import { handleInputValidationErrors } from "../../../../../utils/singup/validation/validationUtils";
import Verificacion from "../../../../../models/verificaciones/verificationsModel";


const validateVerificationFieldsPhoneSend = (usuario: string, celular: string): string[] => {
    const errors: string[] = [];
    if (!usuario || !celular) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};
// Busca un usuario por nombre de usuario, incluyendo su información de verificación
const findUserByUsernamePhoneSend = async (usuario: string, res: Response) => {
    const user = await Usuario.findOne({ where: { usuario: usuario }, include: [Verificacion] });

    if (!user) {
        return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
    }
    return user;
};
const checkUserVerificationStatusPhoneSend = (user: any) => {
    if (isUserAlreadyVerifiedPhoneSend(user)) {
        throw new Error(errorMessages.userAlreadyVerified);
    }

};

const isUserAlreadyVerifiedPhoneSend = (user: any) => {
    return user.verificacion.verificado || user.verificacion.correo_verificado;
};

export const sendVerificationCode = async (req: Request, res: Response) => {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernamePhoneSend(usuario, res);

        checkUserVerificationStatusPhoneSend(user);

    } catch (error: any) {
        handleServerErrorPhoneSend(error, res);

    }
}

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrorPhoneSend = (error: any, res: Response) => {
    console.error("Error en el controlador phonesend:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message ||  errorMessages.databaseError,
            error,
        });
    }
};