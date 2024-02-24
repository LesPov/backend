"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRol = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../database/connection"));
const usuariosModel_1 = __importDefault(require("../usuarios/usuariosModel")); // Importamos el modelo de usuarios
const rolModel_1 = __importDefault(require("../rol/rolModel")); // Importamos el modelo de roles
exports.UsuarioRol = connection_1.default.define('usuario_rol', {
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: usuariosModel_1.default,
            key: 'usuario_id'
        }
    },
    rol_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: rolModel_1.default,
            key: 'rol_id'
        }
    },
    fecha_registro: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fecha_actualizacion: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});
// Establecemos las relaciones con los modelos de usuarios y roles
usuariosModel_1.default.belongsToMany(rolModel_1.default, { through: exports.UsuarioRol, foreignKey: 'usuario_id' });
rolModel_1.default.belongsToMany(usuariosModel_1.default, { through: exports.UsuarioRol, foreignKey: 'rol_id' });
exports.default = exports.UsuarioRol;
