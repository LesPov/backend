"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationCode = void 0;
const VERIFICATION_CODE_EXPIRATION_MINUTES = 1;
// En utils.ts
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
// En un archivo de utilidad, por ejemplo, generateVerification.ts
