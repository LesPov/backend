import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import Usuario, { UsuarioModel } from '../../../../../models/usuarios/usuariosModel';
import Verificacion, { VerificacionModel } from '../../../../../models/verificaciones/verificationsModel';
import Rol from '../../../../../models/rol/rolModel';
import { Op } from 'sequelize';
import { checkUserVerificationStatusLogin } from '../../../../../utils/acceso/login/userVerification/userVerification';
import { sendPasswordResetEmail } from '../../../../../utils/singup/emailsend/emailUtils';
import { successMessages } from '../../../../../middleware/successMessages';


/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_HOURS = 5;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
export const validateVerificationFieldsRecoveryPass = (usernameOrEmail: string): string[] => {
    const errors: string[] = [];

    if (!usernameOrEmail) {
        errors.push(errorMessages.missingUsernameOrEmail);
    } else if (!EMAIL_REGEX.test(usernameOrEmail)) {
        errors.push(errorMessages.invalidEmail);
    }

    return errors;
};



/**
 * Buscar un usuario por nombre de usuari o email  incluyendo su información de verificación y rol.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
export const findUserByUsernameRecoveryPass = async (usernameOrEmail: string, res: Response): Promise<UsuarioModel> => {
    const user = await Usuario.findOne({
        where: {
            [Op.or]: [
                { usuario: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        },
        include: [
            {
                model: Verificacion, // Incluye la relación Verificacion
            },
            {
                model: Rol, // Incluye la relación con el modelo de rol
            },
        ],
    });
    if (!user) {
        // Devuelve un error si el usuario no existe
        res.status(400).json({ msg: errorMessages.userNotExists(usernameOrEmail) });
        // En este punto, puedes lanzar un error o devolver un objeto que indique la ausencia del usuario.
        throw new Error("Usuario no encontrado");
    }

    return user as UsuarioModel;

};

/**
 * Genera una contraseña aleatoria.
 * @param {number} length - Longitud de la contraseña generada.
 * @returns {string} - Contraseña aleatoria.
 */
export const generateRandomPasswordRecoveryPass = (length: number): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPassword = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomPassword += characters.charAt(randomIndex);
    }

    return randomPassword;
};

/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Objeto con la contraseña aleatoria de 8 dígitos y la fecha de expiración del código de verificación.
 */
export const generateRandomVerificationDataRecoveryPass = () => {
    // Generate an 8-digit random password
    const randomPassword = generateRandomPasswordRecoveryPass(8);

    // Calculate expiration date 24 hours from now
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getMinutes() + VERIFICATION_CODE_EXPIRATION_HOURS);

    // Log the generated password
    console.log('Generated Password:', randomPassword);

    return { randomPassword: randomPassword, expirationDate };
};
/**
 * Función que busca un registro de verificación para un usuario en la base de datos.
 * Si no existe, crea uno nuevo.
 * @param usuario_id - ID del usuario.
 * @returns Registro de verificación.
 */
export const findOrCreateVerificationRecoveryPass= async (usuario_id: number) => {
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
export const updateVerificationCodeInfoRecoveryPass = async (verificationRecord: any, randomPassword: string, expirationDate: Date) => {
    try {
        await verificationRecord.update({
            contrasena_aleatoria: randomPassword,
            expiracion_codigo_verificacion: expirationDate
        });
    } catch (error) {
        // Manejar errores específicos de la actualización
        throw new Error("Error actualizando el código de verificación");
    }
};



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

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrorRecoveryPass = (error: any, res: Response) => {
    console.error("Error en el controlador passwordRecoveryPass:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
