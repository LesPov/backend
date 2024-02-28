"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLoginAttempts = exports.getUserByUsername = void 0;
const usuariosModel_1 = __importDefault(require("../../models/usuarios/usuariosModel"));
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield usuariosModel_1.default.findOne({
        where: { usuario: username },
        include: ['verificacion'],
    });
});
exports.getUserByUsername = getUserByUsername;
const resetLoginAttempts = (user) => __awaiter(void 0, void 0, void 0, function* () {
    yield user.verificacion.update({ intentos_ingreso: 0 });
});
exports.resetLoginAttempts = resetLoginAttempts;
