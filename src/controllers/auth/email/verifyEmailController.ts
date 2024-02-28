import { Request, Response } from 'express';
import Usuario from '../../../models/usuarios/usuariosModel';
import Verificacion from '../../../models/verificaciones/verificationsModel';
import { errorMessages } from '../../../middleware/errorMesages';
import { successMessages } from '../../../middleware/successMessages';

// Busca un usuario por nombre de usuario, incluyendo su información de verificación
const findUserByUsername = async (usuario: string) => {
  return Usuario.findOne({ where: { usuario: usuario }, include: [Verificacion] });
};

// Verifica si el usuario ya está verificado por correo electrónico
const isUserAlreadyVerified = (user: any) => {
  return user.verificacion.correo_verificado;
};

// Verifica si el código de verificación ha expirado
const isVerificationCodeExpired = (user: any, currentDate: Date) => {
  return user.verificacion.expiracion_codigo_verificacion &&
    user.verificacion.expiracion_codigo_verificacion < currentDate;
};

// Verifica si el código de verificación proporcionado es válido
const isInvalidVerificationCode = (user: any, codigo_verificacion: string) => {
  return user.verificacion.codigo_verificacion !== codigo_verificacion.trim();
};

// Marca el correo electrónico del usuario como verificado
const markEmailAsVerified = async (usuario_id: number) => {
  await Verificacion.update({ correo_verificado: true }, { where: { usuario_id } });
};

// Marca al usuario como verificado
const markUserAsVerified = async (usuario_id: number) => {
  await Verificacion.update({ verificado: true }, { where: { usuario_id } });
};

// Verifica el estado de verificación del usuario
const checkUserVerificationStatus = (user: any) => {
  if (isUserAlreadyVerified(user)) {
    throw new Error(errorMessages.userAlreadyVerified);
  }
};

// Verifica si el código de verificación ha expirado
const checkVerificationCodeExpiration = (user: any, currentDate: Date) => {
  if (isVerificationCodeExpired(user, currentDate)) {
    throw new Error(errorMessages.verificationCodeExpired);
  }
};

// Verifica si el código de verificación proporcionado es inválido
const checkInvalidVerificationCode = (user: any, codigo_verificacion: string) => {
  if (isInvalidVerificationCode(user, codigo_verificacion)) {
    throw new Error(errorMessages.invalidVerificationCode);
  }
};

// Maneja la verificación del correo electrónico del usuario
const handleEmailVerification = async (usuario_id: number) => {
  await markEmailAsVerified(usuario_id);
};

// Maneja la verificación del usuario (si está asociado a un número de teléfono)
const handleUserVerification = async (usuario_id: number, celular_verificado: boolean) => {
  if (celular_verificado) {
    await markUserAsVerified(usuario_id);
  }
};

// Maneja la verificación del usuario, verificando el correo electrónico y el usuario en sí
const handleVerification = async (user: any, codigo_verificacion: string, currentDate: Date) => {
  checkUserVerificationStatus(user);
  checkVerificationCodeExpiration(user, currentDate);
  checkInvalidVerificationCode(user, codigo_verificacion);

  await handleEmailVerification(user.usuario_id);
  await handleUserVerification(user.usuario_id, user.verificacion.celular_verificado);
};

// Controlador principal para verificar al usuario
export const verifyUser = async (req: Request, res: Response) => {
    try {
        const { usuario, codigo_verificacion } = req.body;

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsername(usuario);
        if (!user) {
            return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
        }

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
        res.status(400).json({ msg: error.message }); // Enviar el mensaje de error del objeto de error
    }
};
