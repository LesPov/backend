import { Request, Response } from 'express';
import { findUserByUsernameLogin, handleServerErrorLogin, validateVerificationFieldslogin } from '../../../utils/acceso/login/userValidation/userValidation';
import { handleInputValidationErrors } from '../../../utils/singup/validation/validationUtils';
import { handleSuccessfulLogin } from '../../../utils/acceso/login/handleSuccessfulLogin/handleSuccessfulLogin';
import {  verifyUserPasswordelogin } from '../../../utils/acceso/login/userVerification/userVerification';
import {  checkLoginAttemptsAndBlockAccountlogin } from '../../../utils/acceso/login/chekLoginBlockAcount/chekLoginBlockAcount';
import { checkUserVerificationStatusLogin } from '../../../utils/acceso/login/checkVerificationStatus/checkVerificationStatus';





export const loginUser = async (req: Request, res: Response) => {
    try {
        const { usernameOrEmail, contrasena } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldslogin(
            usernameOrEmail,
            contrasena);
        handleInputValidationErrors(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameLogin(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);

        // Verificar la contraseña del usuario
        await verifyUserPasswordelogin(contrasena, user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        await checkLoginAttemptsAndBlockAccountlogin(user, res);


        await handleSuccessfulLogin(user, res, contrasena);


    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrorLogin(error, res);
    }
};

