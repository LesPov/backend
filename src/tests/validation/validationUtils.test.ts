// Importa la función handleInputValidationErrors desde el módulo de utilidades de validación
import { handleInputValidationErrors, handlePasswordValidationErrors, validateCharacterClass, validateEmail, validateInput, validateLength, validatePassword } from "../../utils/singup/validation/validationUtils";
import { Response as ExpressResponse } from 'express'; // Importa la interfaz Response desde Express

// Importa los mensajes de error desde el middleware correspondiente
import { errorMessages } from "../../middleware/errorMesages";
// Constante para la longitud mínima de la contraseña

// Describe el conjunto de pruebas para las funciones de validación
describe('Validation Utils', () => {

  // Prueba específica: debería lanzar un error y responder con un mensaje de validación
  it('debería arrojar un error y responder con un mensaje de validación', () => {

    // Llama a la función validateInput con parámetros específicos
    const errors = validateInput('', 'password', 'test@example.com', 'user');

    // Asegúrate de que haya exactamente un error en la lista de errores
    expect(errors).toHaveLength(1);

    // Asegúrate de que el error coincida con el mensaje de campo requerido
    expect(errors[0]).toBe(errorMessages.requiredFields);
  });


  // Describe el conjunto de pruebas para la función handleInputValidationErrors
  describe('handleInputValidationErrors Function', () => {

    // Prueba específica: debería lanzar un error y responder con un mensaje de validación
    it('debería lanzar un error y responder con un mensaje de validación', () => {

      // Crea un objeto mock para la respuesta HTTP
      const mockResponse: ExpressResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as ExpressResponse;

      // Llama a la función handleInputValidationErrors con una lista de errores simulados
      const errors = ['Error 1', 'Error 2'];

      // Utiliza try-catch para manejar cualquier error lanzado por la función
      try {
        handleInputValidationErrors(errors, mockResponse);
      } catch (error: unknown) {
        // Asegúrate de que el mensaje de error lanzado sea el esperado
        if (error instanceof Error) {
          expect(error.message).toBe("Input validation failed");
        } else {
          // Handle unexpected types if needed
          fail("Unexpected error type");
        }
      }

      // Asegúrate de que la función status haya sido llamada con el código de estado 400
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      // Asegúrate de que la función json haya sido llamada con el mensaje de error adecuado
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: 'Error 1. Error 2',
        errors: 'Error en la validación de la entrada de datos',
      });
    });

    // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios

  });
});

// Describe el conjunto de pruebas para la función validatePassword
describe('validatePassword Function', () => {
  it('debería devolver una lista vacía si la contraseña cumple con todos los requisitos', () => {
    const password = 'Test123456-';
    const errors = validatePassword(password);
    expect(errors).toHaveLength(0);
  });


  it('debería devolver una lista de errores si la contraseña es demasiado corta', () => {
    const password = 'Short'; // Contraseña demasiado corta
    const errors = validatePassword(password);
    expect(errors).toContain(errorMessages.passwordTooShort); // Debería contener el mensaje de error correspondiente
  });

  it('debería devolver una lista de errores si la contraseña no contiene números', () => {
    const password = 'PasswordWithoutNumber'; // Contraseña sin números
    const errors = validatePassword(password);
    expect(errors).toContain(errorMessages.passwordNoNumber); // Debería contener el mensaje de error correspondiente
  });

  it('debería devolver una lista de errores si la contraseña no contiene letras mayúsculas', () => {
    const password = 'passwordwithoutuppercase'; // Contraseña sin letras mayúsculas
    const errors = validatePassword(password);
    expect(errors).toContain(errorMessages.passwordNoUppercase); // Debería contener el mensaje de error correspondiente
  });

  it('debería devolver errores para una contraseña sin un carácter especial', () => {
    const passwordWithoutSpecialChar = 'PasswordWithoutSpecialChar123';
    const errors = validatePassword(passwordWithoutSpecialChar);
    expect(errors).toContain(errorMessages.passwordNoSpecialChar);
  });

  it('debería devolver una lista de errores si la contraseña no contiene letras minúsculas', () => {
    const password = 'PASSWORDWITHOUTLOWERCASE'; // Contraseña sin letras minúsculas
    const errors = validatePassword(password);
    expect(errors).toContain(errorMessages.passwordNoLowercase); // Debería contener el mensaje de error correspondiente
  });
});

// Describe el conjunto de pruebas para la función validateLength
describe('validateLength Function', () => {

  // Prueba específica: debería agregar un mensaje de error si la contraseña es demasiado corta
  it('debería agregar un mensaje de error si la contraseña es demasiado corta', () => {

    // Contraseña que no cumple con la longitud mínima
    const contrasena = 'Short';

    // Lista de errores inicialmente vacía
    const errors: string[] = [];

    // Llama a la función validateLength
    validateLength(contrasena, errors);

    // Asegúrate de que haya exactamente un error en la lista de errores
    expect(errors).toHaveLength(1);

    // Asegúrate de que el error coincida con el mensaje de error esperado
    expect(errors[0]).toBe(errorMessages.passwordTooShort);
  });

  // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios

});


// Describe el conjunto de pruebas para la función validateCharacterClass
describe('validateCharacterClass Function', () => {

  // Prueba específica: debería agregar un mensaje de error si la contraseña no contiene un carácter de la clase especificada
  it('debería agregar un mensaje de error si la contraseña no contiene un carácter de la clase especificada', () => {

    // Contraseña sin un carácter especial
    const contrasena = 'PasswordWithoutSpecialChar123';

    // Expresión regular para carácter especial
    const characterClass = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

    // Lista de errores inicialmente vacía 
    const errors: string[] = [];

    // Mensaje de error esperado
    const errorMessage = errorMessages.passwordNoSpecialChar;

    // Llama a la función validateCharacterClass
    validateCharacterClass(contrasena, characterClass, errorMessage, errors);

    // Asegúrate de que haya exactamente un error en la lista de errores
    expect(errors).toHaveLength(1);

    // Asegúrate de que el error coincida con el mensaje de error esperado
    expect(errors[0]).toBe(errorMessage);
  });

  // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios

});

// Describe el conjunto de pruebas para la función handlePasswordValidationErrors
describe('handlePasswordValidationErrors Function', () => {

  // Prueba específica: debería enviar una respuesta con errores de validación de contraseña
  it('debería enviar una respuesta con errores de validación de contraseña', () => {

    // Crea un objeto mock para la respuesta HTTP
    const mockResponse: ExpressResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as ExpressResponse;

    // Lista de errores simulados de validación de contraseña
    const errors = ['Error 1', 'Error 2'];

    // Utiliza try-catch para manejar cualquier error lanzado por la función
    try {
      // Llama a la función handlePasswordValidationErrors
      handlePasswordValidationErrors(errors, mockResponse);
    } catch (error: unknown) {
      // Asegúrate de que el mensaje de error lanzado sea el esperado
      if (error instanceof Error) {
        expect(error.message).toBe("Password validation failed");
      } else {
        // Handle unexpected types if needed
        fail("Unexpected error type");
      }
    }

    // Asegúrate de que la función status haya sido llamada con el código de estado 400
    expect(mockResponse.status).toHaveBeenCalledWith(400);

    // Asegúrate de que la función json haya sido llamada con el mensaje de error adecuado
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: ['Error 1', 'Error 2'],
      errors: 'Error en la validación de la contraseña',
    });
  });

  // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios

});

// Describe el conjunto de pruebas para la función validateEmail
describe('validateEmail Function', () => {

  // Prueba específica: debería lanzar un error si el correo electrónico no tiene el formato correcto
  it('debería lanzar un error si el correo electrónico no tiene el formato correcto', () => {

    // Correo electrónico con formato incorrecto
    const invalidEmail = 'invalidemail.com';

    // Utiliza try-catch para manejar el error lanzado por la función
    try {
      // Llama a la función validateEmail
      validateEmail(invalidEmail);
    } catch (error: unknown) {
      // Asegúrate de que el mensaje de error lanzado sea el esperado
      if (error instanceof Error) {
        expect(error.message).toBe(errorMessages.invalidEmail);
      } else {
        // Handle unexpected types if needed
        fail("Unexpected error type");
      }
    }
  });

  // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios

}); 