import { errorMessages } from "../../../../../middleware/errorMessages";

// Verifica el estado de verificación del usuario
export const checkUserVerificationStatusPhoneResend = (user: any) => {
    if (isUserAlreadyVerifiedPhoneResend(user)) {
        throw new Error(errorMessages.phoneAlreadyVerified);
    }

};
// Verifica si el usuario ya está verificado por correo electrónico
export const isUserAlreadyVerifiedPhoneResend = (user: any) => {
    return user.verificacion.celular_verificado;
};

