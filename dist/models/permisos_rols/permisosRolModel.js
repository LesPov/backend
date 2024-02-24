"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolPermiso = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../../database/connection"));
const rolModel_1 = __importDefault(require("../rol/rolModel")); // Importamos el modelo de roles
const permisosModel_1 = __importDefault(require("../permisos/permisosModel")); // Importamos el modelo de permisos
exports.RolPermiso = connection_1.default.define('rol_permisos', {
    rol_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: rolModel_1.default,
            key: 'rol_id'
        }
    },
    permiso_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: permisosModel_1.default,
            key: 'permiso_id'
        }
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});
// Establecemos las relaciones con los modelos de roles y permisos
rolModel_1.default.belongsToMany(permisosModel_1.default, { through: exports.RolPermiso, foreignKey: 'rol_id' });
permisosModel_1.default.belongsToMany(rolModel_1.default, { through: exports.RolPermiso, foreignKey: 'permiso_id' });
exports.default = exports.RolPermiso;
