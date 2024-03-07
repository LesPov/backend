"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAuthToken = (user) => {
    // Obtener los roles del usuario
    const roles = getUserRoles(user);
    // Crear el payload del token
    const payload = createTokenPayload(user, roles);
    // Firmar el token
    return signToken(payload);
};
exports.generateAuthToken = generateAuthToken;
// Obtener los roles del usuario
const getUserRoles = (user) => Array.isArray(user === null || user === void 0 ? void 0 : user.rols) ? mapRoles(user.rols) : [];
// Mapear roles
const mapRoles = (roles) => roles.map((rol) => rol.nombre);
// Crear el payload del token
const createTokenPayload = (user, roles) => {
    return {
        usuario: user.usuario,
        usuario_id: user.usuario_id,
        rol: roles.length > 0 ? roles[0] : null, // Tomar el primer rol si existe, o null si no hay roles
    };
};
// Firmar el token
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY || 'pepito123');
};
