import { DataTypes, Model } from 'sequelize';
import sequelize from '../../database/connection';

// Modelo para la tabla 'permisos'
export interface PermisoModel extends Model {
    [x: string]: any;

    permiso_id: number;
    nombre: string;
    descripcion: string;
}

export const Permiso = sequelize.define<PermisoModel>('permisos', {
    permiso_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export default Permiso;
  