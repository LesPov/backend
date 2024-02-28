import { Response } from 'express';

import { generateVerificationCode } from '../paswword_generate/generateCode';
import { errorMessages } from '../../../middleware/errorMesages';
import Rol from '../../../models/rol/rolModel';
import Usuario from '../../../models/usuarios/usuariosModel';
import UsuarioRol from '../../../models/usuarios_rols/usuariosRolModel';
import Verificacion from '../../../models/verificaciones/verificationsModel';

const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
const VERIFICATION_CODE_EXPIRATION_MINUTES = 1;
/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerError = (error: any, res: Response) => {
    console.error("Error en el controlador newUser:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: errorMessages.databaseError,
            error,
        });
    }
};

/**
 * Crea un nuevo usuario en la base de datos y asigna un rol.
 * @param usuario Nombre de usuario.
 * @param hashedPassword Contraseña con hash.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 * @returns El nuevo usuario creado.
 */
export const createNewUserWithRole = async (usuario: string, hashedPassword: string, email: string, rol: string) => {
    try {
        const nuevoUsuario = await Usuario.create({
            usuario: usuario,
            contrasena: hashedPassword,
            email: email,
        });

        await assignUserRole(nuevoUsuario.usuario_id, rol);

        return nuevoUsuario;
    } catch (error) {
        console.error("Error en createNewUser:", error);
        throw errorMessages.databaseError;
    }
};

/**
 * Asigna un rol a un usuario en la base de datos.
 * @param usuarioId ID del usuario.
 * @param rol Rol a asignar.
 */
const assignUserRole = async (usuarioId: number, rol: string) => {
    try {
        const selectedRol = await Rol.findOne({ where: { nombre: rol } });

        if (!selectedRol) {
            throw new Error(errorMessages.invalidRole);
        }

        await UsuarioRol.create({
            usuario_id: usuarioId,
            rol_id: selectedRol.rol_id,
        });
    } catch (error) {
        console.error("Error en assignUserRole:", error);
        throw errorMessages.databaseError;
    }
};

/**
 * Inicializa el perfil de usuario si es necesario.
 * @param usuarioId ID del usuario.
 */
export const initializeUserProfile = async (usuarioId: number) => {
    // Implementa la lógica para inicializar el perfil de usuario si es necesario
};

/**
 * Genera y guarda un código de verificación en la base de datos.
 * @param usuarioId ID del usuario.
 * @param email Dirección de correo electrónico.
 * @returns El código de verificación generado.
 */
export const generateAndSaveVerificationCode = async (usuarioId: number, email: string) => {
    const verificationCode = generateVerificationCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);

    await Verificacion.create({
        usuario_id: usuarioId,
        verificado: false,
        correo_verificado: false,
        codigo_verificacion: verificationCode,
        expiracion_codigo_verificacion: expirationDate,
    });

    return verificationCode;
};
