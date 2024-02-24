import { DataTypes, Model } from 'sequelize';
import sequelize from '../../database/connection';
import Rol from '../rol/rolModel'; // Importamos el modelo de roles
import Permiso from '../permisos/permisosModel'; // Importamos el modelo de permisos

// Modelo para la tabla 'rol_permisos'
export interface RolPermisoModel extends Model {
    [x: string]: any;

    rol_id: number;
    permiso_id: number;
}

export const RolPermiso = sequelize.define<RolPermisoModel>('rol_permisos', {
    rol_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Rol,
            key: 'rol_id'
        }
    },
    permiso_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Permiso,
            key: 'permiso_id'
        }
    },
}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

// Establecemos las relaciones con los modelos de roles y permisos
Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id' });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id' });

export default RolPermiso;
