import { Request, Response } from 'express';
import Usuario from '../../../models/usuarios/usuariosModel';
import Verificacion from '../../../models/verificaciones/verificationsModel';
import { errorMessages } from '../../../middleware/errorMesages';
import { successMessages } from '../../../middleware/successMessages';

const findUserByUsername = async (usuario: string) => {
  return Usuario.findOne({ where: { usuario: usuario }, include: [Verificacion] });
};

const isUserAlreadyVerified = (user: any) => {
  return user.correo_verificado;
};

const isVerificationCodeExpired = (user: any, currentDate: Date) => {
  return user.expiracion_codigo_verificacion && user.expiracion_codigo_verificacion < currentDate;
};

const isInvalidVerificationCode = (user: any, codigo_verificacion: string) => {
  return user.verificacion.codigo_verificacion !== codigo_verificacion.trim();
};

const markEmailAsVerified = async (usuario_id: number) => {
  await Verificacion.update({ correo_verificado: true }, { where: { usuario_id } });
};

const markUserAsVerified = async (usuario_id: number) => {
  await Verificacion.update({ isVerified: true }, { where: { usuario_id } });
};

const checkUserVerificationStatus = (user: any) => {
  if (isUserAlreadyVerified(user)) {
    throw new Error(errorMessages.userAlreadyVerified);
  }
};

const checkVerificationCodeExpiration = (user: any, currentDate: Date) => {
  if (isVerificationCodeExpired(user, currentDate)) {
    throw new Error(errorMessages.verificationCodeExpired);
  }
};

const checkInvalidVerificationCode = (user: any, codigo_verificacion: string) => {
  if (isInvalidVerificationCode(user, codigo_verificacion)) {
    throw new InvalidVerificationCodeError(errorMessages.invalidVerificationCode);
  }
};

const handleEmailVerification = async (usuario_id: number) => {
  await markEmailAsVerified(usuario_id);
};

const handleUserVerification = async (usuario_id: number, celular_verificado: boolean) => {
  if (celular_verificado) {
    await markUserAsVerified(usuario_id);
  }
};

const handleVerification = async (user: any, codigo_verificacion: string, currentDate: Date) => {
  checkUserVerificationStatus(user);
  checkVerificationCodeExpiration(user, currentDate);
  checkInvalidVerificationCode(user, codigo_verificacion);

  await handleEmailVerification(user.usuario_id);
  await handleUserVerification(user.usuario_id, user.celular_verificado);
};

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class InvalidVerificationCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidVerificationCodeError';
  }
}

export const verifyUser = async (req: Request, res: Response) => {
  const { usuario, codigo_verificacion } = req.body;

  try {
const user = await findUserByUsername(usuario);

    if (!user) {
      return res.status(400).json({
        msg: errorMessages.userExists(usuario),
      });
    }

    const currentDate = new Date();
    await handleVerification(user, codigo_verificacion, currentDate);

    res.json({
      msg: successMessages.userVerified,
    });
  } catch (error: any) {
    if (error instanceof InvalidVerificationCodeError) {
      return res.status(403).json({
        msg: error.message,
      });
    } else if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        msg: error.message,
      });
    }

    res.status(400).json({
      msg: errorMessages.databaseError,
      error: error.message,
    });
  }
};
