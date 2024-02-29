import Verificacion from "../../../models/verificaciones/verificationsModel";
import { checkUserVerificationStatus, checkVerificationCodeExpiration, checkInvalidVerificationCode } from "../userVerification/userVerification";

// Marca el correo electrónico del usuario como verificado
export const markEmailAsVerified = async (usuario_id: number) => {
    await Verificacion.update({ correo_verificado: true }, { where: { usuario_id } });
};

// Marca al usuario como verificado
export const markUserAsVerified = async (usuario_id: number) => {
    await Verificacion.update({ verificado: true }, { where: { usuario_id } });
};

// Maneja la verificación del correo electrónico del usuario
export const handleEmailVerification = async (usuario_id: number) => {
    await markEmailAsVerified(usuario_id);
};

// Maneja la verificación del usuario (si está asociado a un número de teléfono)
export const handleUserVerification = async (usuario_id: number, celular_verificado: boolean) => {
    if (celular_verificado) {
        await markUserAsVerified(usuario_id);
    }
};

// Maneja la verificación del usuario, verificando el correo electrónico y el usuario en sí
export const handleVerification = async (user: any, codigo_verificacion: string, currentDate: Date) => {
    checkUserVerificationStatus(user);
    checkVerificationCodeExpiration(user, currentDate);
    checkInvalidVerificationCode(user, codigo_verificacion);

    await handleEmailVerification(user.usuario_id);
    await handleUserVerification(user.usuario_id, user.verificacion.celular_verificado);
};