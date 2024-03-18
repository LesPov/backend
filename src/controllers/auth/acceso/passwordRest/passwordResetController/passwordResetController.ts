import { Request, Response } from 'express';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { findOrCreateVerificationRecoveryPass, findUserByUsernameRecoveryPass } from '../passwordRecoveryController/passwordRecoveryController';
import { checkUserVerificationStatusLogin } from '../../../../../utils/acceso/login/checkVerificationStatus/checkVerificationStatus';
import { verifyUserPasswordelogin } from '../../../../../utils/acceso/login/userVerification/userVerification';
import { checkLoginAttemptsAndBlockAccountlogin } from '../../../../../utils/acceso/login/chekLoginBlockAcount/chekLoginBlockAcount';
import { handleServerErrordResetPass, validateVerificationFieldsResetPass } from '../../../../../utils/acceso/passwordRest/passwordResetController/validateFields/validateFields';
import { validatePasswordErrorsResetPass } from '../../../../../utils/acceso/passwordRest/passwordResetController/validateNewPassword/validateNewPassword';
import { updateAndClearPasswordResetPass } from '../../../../../utils/acceso/passwordRest/passwordResetController/updatePassword/updatePassword';




//////////////////////////////////////////////////////
export const passwordresetPass = async (req: Request, res: Response) => {
    try {
        const { usernameOrEmail, contrasena_aleatoria, newPassword } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldsResetPass(
            usernameOrEmail,
            contrasena_aleatoria,
            newPassword
        );
        handleInputValidationErrors(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameRecoveryPass(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);
        // Buscar o crear un registro de verificación para el usuario
        const verification = await findOrCreateVerificationRecoveryPass(user.usuario_id);
        // Verificar la contraseña del usuario
        await verifyUserPasswordelogin(contrasena_aleatoria, user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta

        await checkLoginAttemptsAndBlockAccountlogin(user, res);

        // Validar la nueva contraseña
        const passwordErrors = validatePasswordErrorsResetPass(res, newPassword);
        if (passwordErrors.length > 0) {
            // Si hay errores en la nueva contraseña, no se actualiza la contraseña en la base de datos
            return;
        }
        // Actualizar y borrar la contraseña del usuario
        await updateAndClearPasswordResetPass(user, verification, newPassword);

        // Restablecimiento de contraseña exitoso
        res.status(200).json({ msg: successMessages.passwordUpdated });
    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrordResetPass(error, res);
    }
};
