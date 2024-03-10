"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorMessages_1 = require("../errorMessages");
// Middleware para validar el token de autenticación
const validateToken = (req, res, next) => {
    // Obtención del token del encabezado de la solicitud
    const headerToken = req.headers['authorization'];
    try {
        // Verificación de la presencia y formato correcto del token en el encabezado
        checkTokenPresenceAndFormat(headerToken);
        // Extracción del token Bearer
        const bearerToken = extractBearerToken(headerToken);
        // Verificación del token y obtención de la información del usuario
        const decodedToken = verifyTokenAndGetUser(bearerToken);
        // Adjuntar la información del usuario a la solicitud
        attachUserInfoToRequest(req, decodedToken);
        // Continuar con el siguiente middleware o ruta
        next();
    }
    catch (error) {
        // Manejo de errores durante la verificación del token
        handleTokenVerificationError(error, res);
    }
};
// Función para verificar la presencia y formato correcto del token
const checkTokenPresenceAndFormat = (headerToken) => {
    if (!headerToken || !headerToken.startsWith('Bearer ')) {
        throw new Error(errorMessages_1.errorMessages.accessDeniedNoToken);
    }
};
// Función para extraer el token Bearer del encabezado
const extractBearerToken = (headerToken) => {
    return headerToken.slice(7);
};
// Función para verificar el token y obtener la información del usuario
const verifyTokenAndGetUser = (bearerToken) => {
    return jsonwebtoken_1.default.verify(bearerToken, process.env.SECRET_KEY || 'pepito123');
};
// Función para adjuntar la información del usuario a la solicitud
const attachUserInfoToRequest = (req, decodedToken) => {
    req.user = decodedToken;
};
// Función para manejar errores durante la verificación del token
const handleTokenVerificationError = (error, res) => {
    res.status(401).json({
        msg: errorMessages_1.errorMessages.invalidToken,
    });
};
// Exportar el middleware para su uso en otras partes de la aplicación
exports.default = validateToken;
