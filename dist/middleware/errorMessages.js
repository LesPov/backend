"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessages = void 0;
exports.errorMessages = {
    // Errores de registro
    requiredFields: 'Todos los campos son obligatorios',
    userExists: (username) => `Ya existe un usuario con el nombre ${username}`,
    databaseError: 'Upps ocurrió un error en la base de datos',
    invalidEmail: 'La dirección de correo electrónico no es válida',
    passwordTooShort: 'La contraseña debe tener al menos 10 caracteres',
    passwordNoNumber: 'La contraseña debe contener al menos un número',
    passwordNoUppercase: 'La contraseña debe contener al menos una letra mayúscula',
    passwordNoLowercase: 'La contraseña debe contener al menos una letra minúscula',
    invalidRole: `rol invalido`,
    passwordNoSpecialChar: 'La contraseña debe contener al menos un carácter especial',
    // Errores de login 
    userNotExists: (username) => `No existe un usuario con el nombre ${username} en la base de datos`,
    invalidPassword: 'Contraseña incorrecta',
    userNotVerified: 'El usuario aún no ha sido verificado. Verifica tu correo electrónico para activar tu cuenta.',
    numberNotVerified: 'El usuario aún no ha sido verificado. Verifica tu numero celular para activar tu cuenta.',
    accountLocked: 'La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde.',
    accountLockedv1: (timeLeft) => `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos.`,
    incorrectPassword: (attempts) => ` Contraseña incorrecta. Intentos fallidos: ${attempts}`,
    verificationCodeNotFound: `Codigo a expirado registrate de nuevo `,
    // Errores de validación de roles y tokens
    tokenNotProvided: 'Acceso denegado, token no proporcionado',
    accessDenied: 'Acceso denegado, no tienes permisos para acceder a esta ruta',
    invalidToken: 'Token no válido',
    accessDeniedNoToken: 'Acceso denegado',
    serverError: 'servidor error',
    // Errores de verificación de usuario   
    userAlreadyVerified: 'El usuario ya ha sido verificado previamente',
    verificationCodeExpired: 'El código de verificación ha expirado. Registra una nueva cuenta para obtener un nuevo código.',
    invalidVerificationCode: 'El usuario aún no ha sido verificado. Codigo invalido.',
    verificationRecordNotFound: 'eregistro de verificación correspondiente al usuario no encontrada ',
    noVerificationRecord: 'lapapa',
    // Errores de envío de código de verificación por SMS 
    phoneNumberNotProvided: 'El número de teléfono es obligatorio para enviar el código de verificación por SMS',
    phoneNumberExists: 'El número de teléfono ya ha sido registrado en la base de datos. ingresa otro',
    phoneNumberVerificationError: 'Error al enviar el código de verificación por SMS',
    emailVerificationError: 'Ocurrió un error al reenviar el código de verificación por correo electrónico',
    userEmailExists: (email) => `Ya existe un correo ${email}`,
    // Errores de verificación de número de teléfono 
    incorrectPhoneNumber: 'El número de teléfono no coincide con el registrado para este usuario',
    phoneAlreadyVerified: 'El número de teléfono ya ha sido verificado previamente',
    phoneNumberInUse: 'El número de teléfono ya ha sido registrado para este usuario',
    phoneVerificationRequired: 'El usuario aún no ha sido verificado. Verifica tu numero celular para activar tu cuenta.',
    verificadoVericationRequired: 'El usuario aún no ha sido verificado. Verifica tu numero celular y correo para activar tu cuenta.',
    // Errores de recuperación y cambio de contraseña
    missingUsernameOrEmail: 'Todos los campos son obligatorios. Se requiere el nombre de usuario o correo electrónico.',
    userNotFound: 'Usuario no encontrado',
    passwordValidationFailed: 'La contraseña no cumple con los requisitos de validación',
    unverifiedAccount: 'Tu correo electrónico o número teléfono no han sido verificados.',
    invalidRandomPassword: 'Contraseña aleatoria incorrecta',
    invalidNewPassword: 'contraseña lol',
    invalidRandomPassworde: 'ya expiro la contraseña',
    incorrectPasswordWithAttempts: 'se requiere la contraseña normal',
    incorrectRandomPassword: 'la contraseña no es valida',
    userAlreadyVerifiedInvalidCode: 'El usuario ya está verificado, pero el código proporcionado es incorrecto.',
    passwordNoSpecialChar1: 'La contraseña debe contener al menos uno de los siguientes signos: & $ @ _ - /',
    errorMessages: 'Error al subir img',
};
