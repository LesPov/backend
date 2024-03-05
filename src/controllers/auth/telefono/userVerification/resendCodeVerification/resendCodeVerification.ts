import { Request, Response } from 'express';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { validateVerificationFieldsResend, checkUserExistence, generateVerificationData, findOrCreateVerificationRecord, updateVerificationCodeInfo, sendVerificationCodeByEmail, handleemailServerError } from '../../../../../utils/email/userVerification/resendUserVerification/resendUser';
import { handleemailServerErrorPhoneResend, sendVerificationCodeViaSMSPhoneResend } from '../../../../../utils/telefono/userVerification/resendCodeVerification/userUtils/userUtils';
import { checkUserVerificationStatusPhoneResend } from '../../../../../utils/telefono/userVerification/resendCodeVerification/verifcationUtils/verifcationUtils';


/**
 * Controlador para reenviar el código de verificacion de celular.

 */
export const resendVerificationCodePhoneResend = async (req: Request, res: Response) => {

    try {
        // Extraer el nombre de usuario de la solicitud
        const { usuario } = req.body;

        // Validar campos 
        const validationErrors = validateVerificationFieldsResend(usuario);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario en la base de datos junto con su registro de verificación.
        const user = await checkUserExistence(usuario, res);
        // Verificar el estado de verificación del usuario
        checkUserVerificationStatusPhoneResend(user);

        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = generateVerificationData();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = await findOrCreateVerificationRecord(user.usuario_id);

        // Actualizar la información del código de verificación en la base de datos.
        await updateVerificationCodeInfo(verificationRecord, verificationCode, expirationDate);

        // Enviar el código de verificación por SMS
        await sendVerificationCodeViaSMSPhoneResend(user.celular, verificationCode);

        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages.verificationCodeSent,
        });
    } catch (error) {
        // Manejar errores internos
        handleemailServerErrorPhoneResend(error, res);
    }
};

