"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleMessage = void 0;
/**
 * Obtiene un mensaje relacionado con el rol del usuario.
 * @param rol Rol del usuario.
 * @returns Mensaje relacionado con el rol.
 */
const getRoleMessage = (rol) => {
    return rol === 'admin' ? 'administrador' : rol === 'user' ? 'normal' : '';
};
exports.getRoleMessage = getRoleMessage;
