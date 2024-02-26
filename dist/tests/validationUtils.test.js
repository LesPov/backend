"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importa la función handleInputValidationErrors desde el módulo de utilidades de validación
const validationUtils_1 = require("../utils/validation/validationUtils");
// Importa los mensajes de error desde el middleware correspondiente
const { errorMessages } = require('../middleware/errorMesages');
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
        expect(errors[0]).toBe(errorMessages.requiredFields);
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
