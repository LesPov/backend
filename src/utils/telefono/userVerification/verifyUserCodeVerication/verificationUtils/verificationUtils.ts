import { errorMessages } from "../../../../../middleware/errorMessages";


/**
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
export const checkUserVerificationStatusPhoneVerify = (user: any) => {
    if (isUserAlreadyVerifiedPhoneVerify(user)) {
        throw new Error(errorMessages.userAlreadyVerified);
    }
};
/**
 * Verificar si el usuario ya ha sido verificado en celular_verificado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
export const isUserAlreadyVerifiedPhoneVerify = (user: any) => {
    return user.verificacion.celular_verificado;
};
