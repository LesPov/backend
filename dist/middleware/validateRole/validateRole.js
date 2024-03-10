"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorMessages_1 = require("../errorMessages");
// Middleware para validar el rol del usuario
const validateRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            // Extracción del token de autorización desde la solicitud
            const token = extractToken(req);
            // Obtención del rol del usuario desde el token
            const userRole = getUserRoleFromToken(token);
            // Validación del rol del usuario con el rol requerido
            validateUserRole(userRole, requiredRole, res, next);
        }
        catch (error) {
            // Manejo de errores relacionados con la verificación del token
            return res.status(401).json({
                msg: errorMessages_1.errorMessages.invalidToken,
            });
        }
    };
};
// Función para extraer el token de autorización de la solicitud
const extractToken = (req) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    // Verificación de la presencia del token en el encabezado
    if (!token) {
        throw new Error(errorMessages_1.errorMessages.tokenNotProvided);
    }
    return token;
};
// Función para obtener el rol del usuario desde el token
const getUserRoleFromToken = (token) => {
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY || 'pepito123');
    // Obtención del rol desde el token decodificado
    return decodedToken.rol;
};
// Función para validar el rol del usuario con el rol requerido
const validateUserRole = (userRole, requiredRole, res, next) => {
    if (userRole === requiredRole || userRole === 'admin') {
        // Si el rol es válido, se permite el acceso a la ruta protegida
        next();
    }
    else {
        // Si el rol no es válido, se devuelve un código de acceso denegado
        return res.status(403).json({
            msg: errorMessages_1.errorMessages.accessDenied,
        });
    }
};
// Exportar el middleware para su uso en otras partes de la aplicación
exports.default = validateRole;
