"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verificacion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../database/connection"));
const usuariosModel_1 = __importDefault(require("../usuarios/usuariosModel"));
exports.Verificacion = connection_1.default.define('verificacion', {
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: usuariosModel_1.default,
            key: 'usuario_id'
        }
    },
    verificado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    correo_verificado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    codigo_verificacion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    intentos_ingreso: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    expiracion_codigo_verificacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    contrasena_aleatoria: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    celular_verificado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    fecha_registro: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fecha_actualizacion: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});
// Establecemos la relación con el modelo de usuarios
usuariosModel_1.default.hasOne(exports.Verificacion, { foreignKey: 'usuario_id' });
exports.Verificacion.belongsTo(usuariosModel_1.default, { foreignKey: 'usuario_id' });
exports.default = exports.Verificacion;
