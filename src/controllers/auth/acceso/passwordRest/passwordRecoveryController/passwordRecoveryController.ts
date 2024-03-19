import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { sendPasswordResetEmail } from '../../../../../utils/singup/emailsend/emailUtils';
import { successMessages } from '../../../../../middleware/successMessages';
import { checkUserVerificationStatusLogin } from '../../../../../utils/acceso/login/checkVerificationStatus/checkVerificationStatus';
import { handleServerErrorRecoveryPass, validateVerificationFieldsRecoveryPass } from '../../../../../utils/acceso/passwordRest/passwordRecoveryController/validateFields/validateFields';
import { findOrCreateVerificationRecoveryPass, findUserByUsernameRecoveryPass } from '../../../../../utils/acceso/passwordRest/passwordRecoveryController/searchUser/searchUser';
import { generateRandomVerificationDataRecoveryPass } from '../../../../../utils/acceso/passwordRest/passwordRecoveryController/generateRandomPassword/generateRandomPassword';
import { updateVerificationCodeInfoRecoveryPass } from '../../../../../utils/acceso/passwordRest/passwordRecoveryController/updatePassRandom/updatePassRandom';




export const passwordRecoveryPass = async (req: Request, res: Response) => {
    try {


        const { usernameOrEmail } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldsRecoveryPass(usernameOrEmail);
        handleInputValidationErrors(inputValidationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameRecoveryPass(usernameOrEmail, res);

        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);

        // Generar código y fecha de expiración
        const { randomPassword, expirationDate } = generateRandomVerificationDataRecoveryPass();
        // Buscar o crear un registro de verificación para el usuario
        const verificationRecord = await findOrCreateVerificationRecoveryPass(user.usuario_id);

        // Actualizar la información del código de verificación en la base de datos
        await updateVerificationCodeInfoRecoveryPass(verificationRecord, randomPassword, expirationDate);

        // Envía un correo electrónico con la nueva contraseña aleatoria
        const emailSent = await sendPasswordResetEmail(user.email, user.usuario, randomPassword);
        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages.passwordResetEmailSent,
        });
    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrorRecoveryPass(error, res);
    }
};
