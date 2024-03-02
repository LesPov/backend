import { Request, Response } from 'express';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleVerification } from '../../../../../utils/email/userVerification/verifiedUser/email&userverified/email&UserVerified.util';
import { validateVerificationFields, findUserByUsername } from '../../../../../utils/email/userVerification/verifiedUser/verification/verificationUtils';
import { handleServerError } from '../../../../../utils/singup/database/databaseUtils';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { checkInvalidVerificationCode, checkUserVerificationStatus, checkVerificationCodeExpiration } from '../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification';

// Controlador principal para verificar al usuario
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { usuario, codigo_verificacion } = req.body;

    // Validar campos
    const validationErrors = validateVerificationFields(usuario, codigo_verificacion);

    handleInputValidationErrors(validationErrors, res);


    // Buscar al usuario por nombre de usuario
    const user = await findUserByUsername(usuario, res);

    // Validar si el usuario ya está verificado
    checkUserVerificationStatus(user);

    // Validar si el código de verificación ha expirado
    const currentDate = new Date();
    checkVerificationCodeExpiration(user, currentDate);

    // Validar si el código de verificación proporcionado es válido
    checkInvalidVerificationCode(user, codigo_verificacion);

    // Realizar las operaciones de verificación
    await handleVerification(user, codigo_verificacion, currentDate);

    // Responder con un mensaje de éxito
    res.json({ msg: successMessages.userVerified });
  } catch (error: any) {
    // Manejar errores
    handleServerError(error, res);
  }
};
