import { successMessages } from "../../../middleware/successMessages";
import { generateAuthToken } from "../generateAuthToken/generateAuthToken";
import {  Response } from 'express';

export const handleSuccessfulLogin = async (user: any, res: Response, contrasena: string) => {
    const msg = getMessage(contrasena);
    const token = generateAuthToken(user);
    const { userId, rol } = getUserInfo(user);

    return res.json({ msg, token, userId, rol, passwordorrandomPassword: getPasswordOrRandomPassword(user, contrasena) });
};

const getMessage = (contrasena: string): string => {
    return contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages.userLoggedIn;
};

const getUserInfo = (user: any): { userId: string, rol: string | null } => {
    const userId = user.usuario_id;
    const rol = Array.isArray(user.rols) && user.rols.length > 0 ? user.rols[0].nombre : null;
    return { userId, rol };
};


const getPasswordOrRandomPassword = (user: any, contrasena: string): string | undefined => {
    return contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
};