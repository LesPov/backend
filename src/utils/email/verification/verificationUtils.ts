import { errorMessages } from "../../../middleware/errorMesages";
import Usuario from "../../../models/usuarios/usuariosModel";
import Verificacion from "../../../models/verificaciones/verificationsModel";
import { Request, Response } from 'express';

export const validateVerificationFields = (usuario: string, codigo_verificacion: string): string[] => {
    const errors: string[] = [];
    if (!usuario || !codigo_verificacion) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};

// Busca un usuario por nombre de usuario, incluyendo su información de verificación
export const findUserByUsername = async (usuario: string, res: Response) => {
    const user = await Usuario.findOne({ where: { usuario: usuario }, include: [Verificacion] });

    if (!user) {
        return res.status(400).json({ msg: errorMessages.userNotExists(usuario) });
    }
    return user;
};


// Verifica si el usuario ya está verificado por correo electrónico
export const isUserAlreadyVerified = (user: any) => {
    return user.verificacion.correo_verificado;
};

// Verifica si el código de verificación ha expirado
export const isVerificationCodeExpired = (user: any, currentDate: Date) => {
    return user.verificacion.expiracion_codigo_verificacion &&
        user.verificacion.expiracion_codigo_verificacion < currentDate;
};

// Verifica si el código de verificación proporcionado es válido
export const isInvalidVerificationCode = (user: any, codigo_verificacion: string) => {
    return user.verificacion.codigo_verificacion !== codigo_verificacion.trim();
};

