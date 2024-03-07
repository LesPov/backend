import { errorMessages } from "../../../../../middleware/errorMessages";
import { isUserAlreadyVerified, isVerificationCodeExpired, isInvalidVerificationCode } from "../verification/verificationUtils";

// Verifica el estado de verificación del usuario
export const checkUserVerificationStatus = (user: any) => {
    if (isUserAlreadyVerified(user)) {
        throw new Error(errorMessages.userAlreadyVerified);
    }

};

// Verifica si el código de verificación ha expirado
export const checkVerificationCodeExpiration = (user: any, currentDate: Date) => {
    if (isVerificationCodeExpired(user, currentDate)) {
        throw new Error(errorMessages.verificationCodeExpired);
    }
};

// Verifica si el código de verificación proporcionado es inválido
export const checkInvalidVerificationCode = (user: any, codigo_verificacion: string) => {
    if (isInvalidVerificationCode(user, codigo_verificacion)) {
        throw new Error(errorMessages.invalidVerificationCode);
    }
};
