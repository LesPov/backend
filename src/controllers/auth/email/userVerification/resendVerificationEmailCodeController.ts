import { Request, Response } from 'express';
import { errorMessages } from '../../../../middleware/errorMesages';
import { successMessages } from '../../../../middleware/successMessages';
import Usuario from '../../../../models/usuarios/usuariosModel';
import Verificacion from '../../../../models/verificaciones/verificationsModel';
import { sendVerificationEmail } from '../../../../utils/singup/emailsend/emailUtils';


const VERIFICATION_CODE_EXPIRATION_HOURS = 24;

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const calculateExpirationDate = () => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
  return expirationDate;
};

const findOrCreateVerificationRecord = async (usuarioId: number) => {
  let verificationRecord = await Verificacion.findOne({ where: { usuario_id: usuarioId } });

  if (!verificationRecord) {
    verificationRecord = await Verificacion.create({ usuario_id: usuarioId });
  }

  return verificationRecord;
};

const updateVerificationCodeInfo = async (verificationRecord: any, newVerificationCode: string, expirationDate: Date) => {
  await verificationRecord.update({ codigo_verificacion: newVerificationCode, expiracion_codigo_verificacion: expirationDate });
};

const sendVerificationCodeByEmail = async (email: string, username: string, newVerificationCode: string) => {
  return sendVerificationEmail(email, username, newVerificationCode);
};

const isUserNotVerified = (usuario: any) => !usuario || !usuario.verificacion.correo_verificado;

export const resendVerificationCode = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const usuario: any = await Usuario.findOne({ where: { usuario: username }, include: [Verificacion] });

    if (isUserNotVerified(usuario)) {
      const newVerificationCode = generateVerificationCode();
      const expirationDate = calculateExpirationDate();
      const verificationRecord = await findOrCreateVerificationRecord(usuario.usuario_id);

      await updateVerificationCodeInfo(verificationRecord, newVerificationCode, expirationDate);

      const emailSent = await sendVerificationCodeByEmail(usuario.email, usuario.usuario, newVerificationCode);

      if (emailSent) {
        res.json({
          msg: successMessages.verificationCodeResent,
        });
      } else {
        res.status(500).json({
          msg: errorMessages.emailVerificationError,
        });
      }
    } else {
      res.status(400).json({
        msg: errorMessages.userAlreadyVerified,
      });
    }
  } catch (error) {
    res.status(500).json({
      msg: errorMessages.databaseError,
      error,
    });
  }
};
