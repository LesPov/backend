import bcrypt from 'bcryptjs';
import { UsuarioModel } from '../../../../../models/usuarios/usuariosModel';
import { VerificacionModel } from '../../../../../models/verificaciones/verificationsModel';

/////////////////////////////////////////////////////
/**
 * Actualiza y borra la contraseña del usuario.
 * @param user - Objeto de modelo de usuario.
 * @param verification - Objeto de modelo de verificación.
 * @param newPassword - Nueva contraseña a establecer.
 */
export const updateAndClearPasswordResetPass = async (user: UsuarioModel, verificacion: VerificacionModel | null, newPassword: string): Promise<void> => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contrasena = hashedPassword;
    if (verificacion) {
        verificacion.contrasena_aleatoria = '';
        verificacion.intentos_ingreso = 0;
        verificacion.expiracion_codigo_verificacion = new Date();
        await verificacion.save();
    }
    await user.save();
};