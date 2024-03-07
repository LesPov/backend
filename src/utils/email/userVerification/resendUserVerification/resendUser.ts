import { errorMessages } from "../../../../middleware/errorMessages";
import Usuario, { UsuarioModel } from "../../../../models/usuarios/usuariosModel";
import Verificacion from "../../../../models/verificaciones/verificationsModel";
import { sendVerificationEmail } from "../../../singup/emailsend/emailUtils";
import { generateVerificationCode } from "../../../singup/paswword_generate/generateCode";
import { Request, Response } from 'express';

/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;

export const validateVerificationFieldsResend = (usuario: string): string[] => {
    const errors: string[] = [];
    if (!usuario) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};

/**
 * Función que verifica si el usuario existe en la base de datos.
 * @param usuario - Nombre de usuario.
 * @param res - Objeto de respuesta.
 * @returns Usuario si existe, de lo contrario, devuelve un mensaje de error.
 */
export const checkUserExistence = async (usuario: string, res: Response): Promise<UsuarioModel> => {
    const user = await Usuario.findOne({ where: { usuario }, include: [Verificacion] });

    if (!user) {
        // Devuelve un error si el usuario no existe
        res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
        // En este punto, puedes lanzar un error o devolver un objeto que indique la ausencia del usuario.
        throw new Error("Usuario no encontrado");
    }

    return user as UsuarioModel;
};

/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Fecha de expiración del código de verificación.
 */
export const generateVerificationData = () => {
    const verificationCode = generateVerificationCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return { verificationCode, expirationDate };
};

/**
 * Función que busca un registro de verificación para un usuario en la base de datos.
 * Si no existe, crea uno nuevo.
 * @param usuario_id - ID del usuario.
 * @returns Registro de verificación.
 */
export const findOrCreateVerificationRecord = async (usuario_id: number) => {
    let verificationRecord = await Verificacion.findOne({ where: { usuario_id } });

    if (!verificationRecord) {
        verificationRecord = await Verificacion.create({ usuario_id });
    }

    return verificationRecord;
};

/**
 * Función que actualiza la información del código de verificación y su fecha de expiración
 * en el registro de verificación en la base de datos.
 * @param verificationRecord - Registro de verificación.
 * @param newVerificationCode - Nuevo código de verificación.
 * @param expirationDate - Fecha de expiración del nuevo código de verificación.
 */
export const updateVerificationCodeInfo = async (verificationRecord: any, newVerificationCode: string, expirationDate: Date) => {
    try {
        await verificationRecord.update({
            codigo_verificacion: newVerificationCode,
            expiracion_codigo_verificacion: expirationDate
        });
    } catch (error) {
        // Manejar errores específicos de la actualización
        throw new Error("Error actualizando el código de verificación");
    }
};

/**
 * Función que utiliza la función `sendVerificationEmail` para enviar el nuevo código de verificación
 * por correo electrónico al usuario.
 * @param email - Correo electrónico del usuario. 
 * @param username - Nombre de usuario del usuario.
 * @param newVerificationCode - Nuevo código de verificación.
 * @returns Verdadero si el correo electrónico se envía correctamente, de lo contrario, falso.
 */
export const sendVerificationCodeByEmail = async (email: string, username: string, newVerificationCode: string) => {
    return sendVerificationEmail(email, username, newVerificationCode);
};

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleemailServerError = (error: any, res: Response) => {
    console.error("Error en el controlador email:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
