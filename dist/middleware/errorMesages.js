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
    userEmailExists: (email) => `Ya existe un correo ${email}`,
    invalidRole: `rol invalido`,
    passwordNoSpecialChar: 'La contraseña debe contener al menos un carácter especial',
};
