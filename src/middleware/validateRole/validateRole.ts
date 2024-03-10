// Importación de módulos necesarios desde Express y JSON Web Token (JWT)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '../errorMessages';

// Middleware para validar el rol del usuario
const validateRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extracción del token de autorización desde la solicitud
            const token = extractToken(req);

            // Obtención del rol del usuario desde el token
            const userRole = getUserRoleFromToken(token);

            // Validación del rol del usuario con el rol requerido
            validateUserRole(userRole, requiredRole, res, next);
        } catch (error) {
            // Manejo de errores relacionados con la verificación del token
            return res.status(401).json({
                msg: errorMessages.invalidToken,
            });
        }
    };
};

// Función para extraer el token de autorización de la solicitud
const extractToken = (req: Request): string => {
    const token = req.headers['authorization']?.split(' ')[1];

    // Verificación de la presencia del token en el encabezado
    if (!token) {
        throw new Error(errorMessages.tokenNotProvided);
    }

    return token;
};

// Función para obtener el rol del usuario desde el token
const getUserRoleFromToken = (token: string): string => {
    const decodedToken: any = jwt.verify(token, process.env.SECRET_KEY || 'pepito123');
    
    // Obtención del rol desde el token decodificado
    return decodedToken.rol;
};

// Función para validar el rol del usuario con el rol requerido
const validateUserRole = (userRole: string, requiredRole: string, res: Response, next: NextFunction) => {
    if (userRole === requiredRole || userRole === 'admin') {
        // Si el rol es válido, se permite el acceso a la ruta protegida
        next();
    } else {
        // Si el rol no es válido, se devuelve un código de acceso denegado
        return res.status(403).json({
            msg: errorMessages.accessDenied,
        });
    }
};

// Exportar el middleware para su uso en otras partes de la aplicación
export default validateRole;
