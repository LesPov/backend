"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorMessages_1 = require("../errorMessages");
const validateRole = (requiredRole, req, res, next) => {
    try {
        const token = extractToken(req);
        const userRole = getUserRoleFromToken(token);
        validateUserRole(userRole, requiredRole, res, next);
    }
    catch (error) {
        return res.status(401).json({
            msg: errorMessages_1.errorMessages.invalidToken,
        });
    }
};
const extractToken = (req) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        throw new Error(errorMessages_1.errorMessages.tokenNotProvided);
    }
    return token;
};
const getUserRoleFromToken = (token) => {
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY || 'pepito123');
    return decodedToken.rol;
};
const validateUserRole = (userRole, requiredRole, res, next) => {
    if (userRole === requiredRole || userRole === 'admin') {
        // Si el rol es válido, se permite el acceso a la ruta protegida
        next();
    }
    else {
        return res.status(403).json({
            msg: errorMessages_1.errorMessages.accessDenied,
        });
    }
};
exports.default = validateRole;
