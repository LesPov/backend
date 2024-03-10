import jwt from 'jsonwebtoken';

export const generateAuthToken = (user: any) => {
    // Obtener los roles del usuario
    const roles = getUserRoles(user);

    // Crear el payload del token
    const payload = createTokenPayload(user, roles);

    // Firmar el token
    return signToken(payload);
};

// Obtener los roles del usuario
const getUserRoles = (user: any) => Array.isArray(user?.rols) ? mapRoles(user.rols) : [];

// Mapear roles
const mapRoles = (roles: any[]) => roles.map((rol: any) => rol.nombre);

// Crear el payload del token
const createTokenPayload = (user: any, roles: string[]) => {
    return {
        usuario: user.usuario,
        usuario_id: user.usuario_id,
        rol: roles.length > 0 ? roles[0] : null, // Tomar el primer rol si existe, o null si no hay roles
    };
};

// Firmar el token
const signToken = (payload: any) => {
    return jwt.sign(payload, process.env.SECRET_KEY || 'pepito123');
};