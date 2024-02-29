export const errorMessages = {
  // Errores de registro
  requiredFields: 'Todos los campos son obligatorios',
  userExists: (username: string) => `Ya existe un usuario con el nombre ${username}`,
  databaseError: 'Upps ocurrió un error en la base de datos',
  invalidEmail: 'La dirección de correo electrónico no es válida',
  passwordTooShort: 'La contraseña debe tener al menos 10 caracteres',
  passwordNoNumber: 'La contraseña debe contener al menos un número',
  passwordNoUppercase: 'La contraseña debe contener al menos una letra mayúscula',
  passwordNoLowercase: 'La contraseña debe contener al menos una letra minúscula',
  userEmailExists: (email: string) => `Ya existe un correo ${email}`,
  invalidRole: `rol invalido`,
  passwordNoSpecialChar: 'La contraseña debe contener al menos un carácter especial',

  userNotExists: (username: string) => `No existe un usuario con el nombre ${username} en la base de datos`,

 // Errores de verificación de usuario   
 userAlreadyVerified: 'El usuario ya ha sido verificado previamente',
 verificationCodeExpired: 'El código de verificación ha expirado. Registra una nueva cuenta para obtener un nuevo código.',
 invalidVerificationCode: 'El usuario aún no ha sido verificado. Codigo invalido.',


   // Errores de envío de código de verificación por SMS 
   phoneNumberNotProvided: 'El número de teléfono es obligatorio para enviar el código de verificación por SMS',
   phoneNumberExists: 'El número de teléfono ya ha sido registrado para este usuario',
   phoneNumberVerificationError: 'Error al enviar el código de verificación por SMS',
   emailVerificationError: 'Ocurrió un error al reenviar el código de verificación por correo electrónico',
   
};
