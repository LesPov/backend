"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorMessages_1 = require("../errorMessages");
const validateToken = (req, res, next) => {
    const headerToken = req.headers['authorization'];
    try {
        checkTokenPresenceAndFormat(headerToken);
        const bearerToken = extractBearerToken(headerToken);
        const decodedToken = verifyTokenAndGetUser(bearerToken);
        attachUserInfoToRequest(req, decodedToken);
        next();
    }
    catch (error) {
        handleTokenVerificationError(error, res);
    }
};
const checkTokenPresenceAndFormat = (headerToken) => {
    if (!headerToken || !headerToken.startsWith('Bearer ')) {
        throw new Error(errorMessages_1.errorMessages.accessDeniedNoToken);
    }
};
const extractBearerToken = (headerToken) => {
    return headerToken.slice(7);
};
const verifyTokenAndGetUser = (bearerToken) => {
    return jsonwebtoken_1.default.verify(bearerToken, process.env.SECRET_KEY || 'pepito123');
};
const attachUserInfoToRequest = (req, decodedToken) => {
    req.user = decodedToken;
};
const handleTokenVerificationError = (error, res) => {
    res.status(401).json({
        msg: errorMessages_1.errorMessages.invalidToken,
    });
};
exports.default = validateToken;
