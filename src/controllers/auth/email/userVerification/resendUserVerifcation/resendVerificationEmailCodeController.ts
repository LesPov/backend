import { Request, Response } from 'express';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { checkUserVerificationStatus } from '../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification';
import { validateVerificationFieldsResend, checkUserExistence, generateVerificationData, findOrCreateVerificationRecord, updateVerificationCodeInfo, sendVerificationCodeByEmail, handleemailServerError } from '../../../../../utils/email/userVerification/resendUserVerification/resendUser';


/**
 * Controlador para reenviar el código de verificación a un usuario no verificado.
 * @param req - Objeto de solicitud.
 * @param res - Objeto de respuesta.
 */
export const resendVerificationCode = async (req: Request, res: Response) => {

    try {
        // Extraer el nombre de usuario de la solicitud
        const { usuario } = req.body;

        // Validar campos 
        const validationErrors = validateVerificationFieldsResend(usuario);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario en la base de datos junto con su registro de verificación.
        const user = await checkUserExistence(usuario, res);

        // Verificar el estado de verificación del usuario
        checkUserVerificationStatus(user);

        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = generateVerificationData();

        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = await findOrCreateVerificationRecord(user.usuario_id);

        // Actualizar la información del código de verificación en la base de datos.
        await updateVerificationCodeInfo(verificationRecord, verificationCode, expirationDate);

        // Enviar el nuevo código de verificación por correo electrónico.
        await sendVerificationCodeByEmail(user.email, user.usuario, verificationCode);


        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages.verificationCodeResent,
        });
    } catch (error) {
        // Manejar errores internos
        handleemailServerError(error, res);
    }
};

