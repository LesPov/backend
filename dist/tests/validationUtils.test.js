"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importa la función validateInput desde el módulo de utilidades de validación
const validationUtils_1 = require("../utils/validation/validationUtils");
// Importa los mensajes de error desde el middleware correspondiente
const { errorMessages } = require('../middleware/errorMesages');
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
    // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios
});
