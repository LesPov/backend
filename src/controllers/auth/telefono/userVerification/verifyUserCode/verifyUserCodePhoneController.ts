
import { Request, Response } from 'express';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { successMessages } from '../../../../../middleware/successMessages';
import { findUserByUsernamePhoneSend } from '../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils';
import { checkVerificationCodeExpiration } from '../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification';
import { handleServerErrorPhoneVerify, validatePhoneNumberMatchPhoneVerify, validateVerificationFieldsPhoneVerify } from '../../../../../utils/telefono/userVerification/verifyUserCodeVerication/validationUtils/validationUtils';
import { verifySMSCodePhoneVerify } from '../../../../../utils/telefono/userVerification/verifyUserCodeVerication/userUtils/userUtils';
import { checkUserVerificationStatusPhoneVerify } from '../../../../../utils/telefono/userVerification/verifyUserCodeVerication/verificationUtils/verificationUtils';


/**
 * Verificar el  código de verificación enviado por SMS. 
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
export const verifyPhoneNumber = async (req: Request, res: Response) => {
    try {
        const { usuario, celular, codigo_verificacion } = req.body;

        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneVerify(usuario, celular, codigo_verificacion);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernamePhoneSend(usuario, res);

        // Verificar estado de verificación del usuario
        checkUserVerificationStatusPhoneVerify(user);

        // Validar si el código de verificación ha expirado
        const currentDate = new Date();
        checkVerificationCodeExpiration(user, currentDate);

        // Validar si el número de teléfono coincide con el almacenado en la base de datos
        validatePhoneNumberMatchPhoneVerify(user, celular, res);

        // Verificar el código de verificación por SMS
        await verifySMSCodePhoneVerify(user, codigo_verificacion, res);

        // Respuesta de éxito
        res.status(200).json({ msg: successMessages.phoneVerified });

    } catch (error: any) {
        handleServerErrorPhoneVerify(error, res);
    }
};


