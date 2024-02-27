
/**
 * Obtiene un mensaje relacionado con el rol del usuario.
 * @param rol Rol del usuario.
 * @returns Mensaje relacionado con el rol.
 */
export const getRoleMessage = (rol: string) => {
    return rol === 'admin' ? 'administrador' : rol === 'user' ? 'normal' : '';
};
