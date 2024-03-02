import { errorMessages } from "../../../../../middleware/errorMesages";
import Usuario from "../../../../../models/usuarios/usuariosModel";
import { Request, Response } from 'express';
import { checkUserVerificationStatus } from "../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification";
import { handleInputValidationErrors } from "../../../../../utils/singup/validation/validationUtils";


const validateVerificationFieldsPhoneSend = (usuario: string, celular: string): string[] => {
    const errors: string[] = [];
    if (!usuario || !celular) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};
// Busca un usuario por nombre de usuario, incluyendo su información de verificación
export const findUserByUsernamePhoneSend = async (usuario: string, res: Response) => {
    const user = await Usuario.findOne({ where: { usuario: usuario } });

    if (!user) {
        return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
    }
    return user;
};



export const sendVerificationCode = async (req: Request, res: Response) => {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        handleInputValidationErrors(validationErrors, res);
       
        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernamePhoneSend(usuario, res);
        checkUserVerificationStatus(user);

    } catch {

    }
}