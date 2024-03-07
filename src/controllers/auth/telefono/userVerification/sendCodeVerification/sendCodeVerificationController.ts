import { Request, Response } from 'express';
import { handleInputValidationErrors } from "../../../../../utils/singup/validation/validationUtils";
import { updateVerificationCodeInfo } from "../../../../../utils/email/userVerification/resendUserVerification/resendUser";
import { findUserByUsernamePhoneSend, handleServerErrorPhoneSend, validateVerificationFieldsPhoneSend } from "../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils";
import { checkUserVerificationStatusPhoneSend, checkUserPhoneNumberExistsPhoneSend, checkPhoneNumberAvailabilityPhoneSend } from "../../../../../utils/telefono/userVerification/sendCodeVerification/verificationUtils/verificationUtils";
import { findOrCreateVerificationRecordPhoneSend, generateVerificationDataPhoneSend, sendVerificationCodeViaSMSPhoneSend } from "../../../../../utils/telefono/userVerification/sendCodeVerification/userUtils/userUtils";
import { updateUserInfoAfterVerificationCodeSentPhoneSend } from "../../../../../utils/telefono/userVerification/sendCodeVerification/updateUtils/updateUtils";
import { successMessages } from '../../../../../middleware/successMessages';


/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
export const sendCodeVerification = async (req: Request, res: Response) => {
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
        checkUserPhoneNumberExistsPhoneSend(user, celular);

        // Verificar si el teléfono ya está verificado
        await checkPhoneNumberAvailabilityPhoneSend(celular);

        // Generar un código de verificación
        const { verificationCode, expirationDate } = generateVerificationDataPhoneSend();

        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = await findOrCreateVerificationRecordPhoneSend(user);

        // Actualizar la información del código de verificación en la base de datos.
        await updateVerificationCodeInfo(verificationRecord, verificationCode, expirationDate);

        // Enviar el código de verificación por SMS
        await sendVerificationCodeViaSMSPhoneSend(celular, verificationCode);

        // Actualizar la información del usuario después de enviar el código de verificación
        await updateUserInfoAfterVerificationCodeSentPhoneSend(celular, usuario, user);

        // Resto de la lógica para enviar el código de verificación por SMS
        // Responder con un mensaje de éxito
        res.json({ msg: successMessages.verificationCodeSent });
    } catch (error: any) {
        handleServerErrorPhoneSend(error, res);
    }
};

