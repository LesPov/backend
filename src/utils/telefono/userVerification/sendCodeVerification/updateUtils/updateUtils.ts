import Usuario from "../../../../../models/usuarios/usuariosModel";

/**
 * Actualizar la información del usuario después de enviar el código de verificación.
 * @param celular Número de teléfono.
 * @param usuario Nombre de usuario.
 * @param user Objeto de usuario.
 * @returns Resultado de la actualización.
 */
export const updateUserInfoAfterVerificationCodeSentPhoneSend = async (celular: string, usuario: string | null, user: any) => {
    try {
        const updateData = buildUpdateDataPhoneSend(celular);
        const whereClause = buildWhereClausePhoneSend(usuario, user);

        const updateResult = await updateUserInfoPhoneSend(updateData, whereClause);

        logUpdateResultPhoneSend(updateResult);
        return updateResult;
    } catch (error) {
        handleUpdateErrorPhoneSend(error);
    }
};

/**
 * Construir los datos de actualización para la información del usuario.
 * @param celular Número de teléfono.
 * @returns Objeto con datos de actualización.
 */
const buildUpdateDataPhoneSend = (celular: string) => {
    return {
        celular: celular,
        isPhoneVerified: false,
    };
};

/**
 * Construir la cláusula WHERE para la actualización.
 * @param usuario Nombre de usuario.
 * @param user Objeto de usuario.
 * @returns Objeto con cláusula WHERE.
 */
const buildWhereClausePhoneSend = (usuario: string | null, user: any) => {
    return {
        where: { usuario: usuario || user.usuario },
    };
};

/**
 * Actualizar la información del usuario en la base de datos.
 * @param updateData Datos de actualización.
 * @param whereClause Cláusula WHERE.
 * @returns Resultado de la actualización.
 * @throws Error si ocurre un error durante la actualización.
 */
const updateUserInfoPhoneSend = async (updateData: any, whereClause: any) => {
    const updateResult = await Usuario.update(updateData, whereClause);
    return updateResult;
};

/**
 * Registrar el resultado de la actualización en la consola.
 * @param updateResult Resultado de la actualización.
 */
const logUpdateResultPhoneSend = (updateResult: any) => {
    console.log('Resultado de la actualización de Usuarios:', updateResult);
};

/**
 * Manejar errores durante la actualización de la información del usuario.
 * @param error Error ocurrido durante la actualización.
 */
 const handleUpdateErrorPhoneSend = (error: any) => {
    console.error('Error al actualizar la información del usuario después de enviar el código de verificación:', error);
    throw error;
};
