import { DataTypes, Model } from 'sequelize';
import sequelize from '../../database/connection';

// Modelo para la tabla 'rol'
export interface RolModel extends Model {
    [x: string]: any;

    rol_id: number;
    nombre: string;
    sigla: string;
    fecha_registro: Date;
    fecha_actualizacion: Date;
    estado: string;
}

export const Rol = sequelize.define<RolModel>('rol', {
    rol_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sigla: {
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
    estado: {
        type: DataTypes.ENUM('Activado', 'Desactivado'), // Define un enum para limitar los valores posibles
        allowNull: false,
        defaultValue: 'Activado',
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export default Rol;
