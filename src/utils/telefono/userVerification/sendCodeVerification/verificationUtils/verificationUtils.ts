import { errorMessages } from "../../../../../middleware/errorMesages";
import Usuario from "../../../../../models/usuarios/usuariosModel";

/**
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
export const checkUserVerificationStatusPhoneSend = (user: any) => {
    if (isUserAlreadyVerifiedPhoneSend(user)) {
        throw new Error(errorMessages.userAlreadyVerified);
    }
};

/**
 * Verificar si el usuario ya ha sido verificado en las tablas verifcado o correo_verifcado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
export const isUserAlreadyVerifiedPhoneSend = (user: any) => {
    return user.verificacion.verificado || user.verificacion.correo_verificado;
};

/**
 * Verificar la disponibilidad del número de teléfono en la base de datos.
 * @param celular Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 * @throws Error si el número de teléfono ya está registrado.
 */
export const checkPhoneNumberAvailabilityPhoneSend = async (celular: string) => {
    const existingUser = await Usuario.findOne({ where: { celular: celular } });

    if (existingUser) {
        throw new Error(errorMessages.phoneNumberExists);
    }
};

/**
 * Verificar si el número de teléfono ya está asociado al usuario actual.
 * @param user Usuario actual.
 * @param celular Número de teléfono a verificar.
 * @throws Error si el número de teléfono ya está asociado al usuario actual.
 */
export const checkUserPhoneNumberExistsPhoneSend = (user: any, celular: string) => {
    if (user.celular === celular) {
        throw new Error(errorMessages.phoneNumberInUse);
    }
};
