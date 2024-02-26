"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importa la función handleInputValidationErrors desde el módulo de utilidades de validación
const validationUtils_1 = require("../utils/validation/validationUtils");
// Importa los mensajes de error desde el middleware correspondiente
const errorMesages_1 = require("../middleware/errorMesages");
// Constante para la longitud mínima de la contraseña
const PASSWORD_MIN_LENGTH = 8;
// Describe el conjunto de pruebas para las funciones de validación
describe('Validation Utils', () => {
    // Prueba específica: debería lanzar un error y responder con un mensaje de validación
    it('debería arrojar un error y responder con un mensaje de validación', () => {
        // Llama a la función validateInput con parámetros específicos
        const errors = (0, validationUtils_1.validateInput)('', 'password', 'test@example.com', 'user');
        // Asegúrate de que haya exactamente un error en la lista de errores
        expect(errors).toHaveLength(1);
        // Asegúrate de que el error coincida con el mensaje de campo requerido
        expect(errors[0]).toBe(errorMesages_1.errorMessages.requiredFields);
    });
    // Describe el conjunto de pruebas para la función handleInputValidationErrors
    describe('handleInputValidationErrors Function', () => {
        // Prueba específica: debería lanzar un error y responder con un mensaje de validación
        it('debería lanzar un error y responder con un mensaje de validación', () => {
            // Crea un objeto mock para la respuesta HTTP
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            // Llama a la función handleInputValidationErrors con una lista de errores simulados
            const errors = ['Error 1', 'Error 2'];
            // Utiliza try-catch para manejar cualquier error lanzado por la función
            try {
                (0, validationUtils_1.handleInputValidationErrors)(errors, mockResponse);
            }
            catch (error) {
                // Asegúrate de que el mensaje de error lanzado sea el esperado
                if (error instanceof Error) {
                    expect(error.message).toBe("Input validation failed");
                }
                else {
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
        const password = 'Test123456';
        const errors = (0, validationUtils_1.validatePassword)(password);
        expect(errors).toHaveLength(0);
    });
    it('debería devolver una lista de errores si la contraseña es demasiado corta', () => {
        const password = 'Short'; // Contraseña demasiado corta
        const errors = (0, validationUtils_1.validatePassword)(password);
        expect(errors).toContain(errorMesages_1.errorMessages.passwordTooShort); // Debería contener el mensaje de error correspondiente
    });
    it('debería devolver una lista de errores si la contraseña no contiene números', () => {
        const password = 'PasswordWithoutNumber'; // Contraseña sin números
        const errors = (0, validationUtils_1.validatePassword)(password);
        expect(errors).toContain(errorMesages_1.errorMessages.passwordNoNumber); // Debería contener el mensaje de error correspondiente
    });
    it('debería devolver una lista de errores si la contraseña no contiene letras mayúsculas', () => {
        const password = 'passwordwithoutuppercase'; // Contraseña sin letras mayúsculas
        const errors = (0, validationUtils_1.validatePassword)(password);
        expect(errors).toContain(errorMesages_1.errorMessages.passwordNoUppercase); // Debería contener el mensaje de error correspondiente
    });
    it('debería devolver una lista de errores si la contraseña no contiene letras minúsculas', () => {
        const password = 'PASSWORDWITHOUTLOWERCASE'; // Contraseña sin letras minúsculas
        const errors = (0, validationUtils_1.validatePassword)(password);
        expect(errors).toContain(errorMesages_1.errorMessages.passwordNoLowercase); // Debería contener el mensaje de error correspondiente
    });
});
// Describe el conjunto de pruebas para la función validateLength
describe('validateLength Function', () => {
    it('debería agregar un mensaje de error si la contraseña es demasiado corta', () => {
        const password = 'Short'; // Contraseña demasiado corta
        const errors = [];
        (0, validationUtils_1.validateLength)(password, errors);
        expect(errors).toContain(errorMesages_1.errorMessages.passwordTooShort); // Debería contener el mensaje de error correspondiente
    });
    it('no debería agregar ningún mensaje de error si la contraseña cumple con la longitud mínima', () => {
        const password = 'LongEnoughPassword'; // Contraseña con longitud suficiente
        const errors = [];
        (0, validationUtils_1.validateLength)(password, errors);
        expect(errors).not.toContain(errorMesages_1.errorMessages.passwordTooShort); // No debería contener el mensaje de error correspondiente
    });
});
