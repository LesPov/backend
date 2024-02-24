import { DataTypes, Model } from 'sequelize';
import sequelize from '../../database/connection';
import Usuario from '../usuarios/usuariosModel'; // Importamos el modelo de usuarios
import Rol from '../rol/rolModel'; // Importamos el modelo de roles

// Modelo para la tabla 'usuario_rol'
export interface UsuarioRolModel extends Model {
    [x: string]: any;

    usuario_id: number;
    rol_id: number;
    fecha_registro: Date;
    fecha_actualizacion: Date;
    estado: string;
}

export const UsuarioRol = sequelize.define<UsuarioRolModel>('usuario_rol', {
    usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Usuario,
            key: 'usuario_id'
        }
    },
    rol_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Rol,
            key: 'rol_id'
        }
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

// Establecemos las relaciones con los modelos de usuarios y roles
Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuario_id' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rol_id' });

export default UsuarioRol;
