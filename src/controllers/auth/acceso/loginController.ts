import { Request, Response } from 'express';
import { handleInputValidationErrors } from '../../../utils/singup/validation/validationUtils';
import { findUserByUsernameLogin, handleServerErrorLogin, validateVerificationFieldsLogin } from '../../../utils/acceso/login/userValidation/userValidation';
import { checkLoginAttemptsAndBlockAccount, checkUserVerificationStatusLogin } from '../../../utils/acceso/login/userVerification/userVerification';
import { verifyUserPassworde } from '../../../utils/acceso/login/passwordValidation/passwordValidation';
import { handleSuccessfulLogin } from '../../../utils/acceso/login/handleSuccessfulLogin/handleSuccessfulLogin';



////////////////////////////////////////////////////////////////////
/**
 * Controlador para inicar sesion.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
export const loginUser = async (req: Request, res: Response) => {
    try {


        const { usuario, contrasena_aleatoria } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldsLogin(usuario, contrasena_aleatoria);

        handleInputValidationErrors(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameLogin(usuario, res);

        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);

        // Verificar la contraseña del usuario
        await verifyUserPassworde(contrasena_aleatoria, user, res);

        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        await checkLoginAttemptsAndBlockAccount(user, res);


        await handleSuccessfulLogin(user, res, contrasena_aleatoria);


    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrorLogin(error, res);
    }
};

