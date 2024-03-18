
/**
 * Función que actualiza la información del código de verificación y su fecha de expiración
 * en el registro de verificación en la base de datos.
 * @param verificationRecord - Registro de verificación.
 * @param newVerificationCode - Nuevo código de verificación.
 * @param expirationDate - Fecha de expiración del nuevo código de verificación.
 */
export const updateVerificationCodeInfoRecoveryPass = async (verificationRecord: any, randomPassword : string, expirationDate: Date) => {
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
