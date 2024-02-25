"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importa la función validateLength desde el módulo de utilidades de validación
const validationUtils_1 = require("../utils/validation/validationUtils");
// Importa los mensajes de error desde el middleware correspondiente
const { errorMessages } = require('../middleware/errorMesages');
// Describe el conjunto de pruebas para las funciones de validación
describe('Validation Utils', () => {
    // Prueba específica para validateInput: debería arrojar un error y responder con un mensaje de validación
    it('debería arrojar un error y responder con un mensaje de validación', () => {
        // Llama a la función validateInput con parámetros específicos
        const errors = (0, validationUtils_1.validateInput)('', 'password', 'test@example.com', 'user');
        // Asegúrate de que haya exactamente un error en la lista de errores
        expect(errors).toHaveLength(1);
        // Asegúrate de que el error coincida con el mensaje de campo requerido
        expect(errors[0]).toBe(errorMessages.requiredFields);
    });
    // Prueba específica para validateLength: debería agregar un error si la contraseña es demasiado corta
    it('debería agregar un error si la contraseña es demasiado corta', () => {
        // Define una contraseña que sea demasiado corta
        const password = 'short';
        // Crea una lista de errores inicialmente vacía
        let errors = [];
        // Llama a la función validateLength con la contraseña y la lista de errores
        (0, validationUtils_1.validateLength)(password, errors);
        // Asegúrate de que ahora haya un error en la lista de errores
        expect(errors).toHaveLength(1);
        // Asegúrate de que el error coincida con el mensaje de contraseña demasiado corta
        expect(errors[0]).toBe(errorMessages.passwordTooShort);
    });
    // Puedes agregar más casos de prueba según sea necesario para cubrir diferentes escenarios
});
