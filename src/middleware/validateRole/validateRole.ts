import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '../errorMessages';

const validateRole = (requiredRole: string, req: Request, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req);
        const userRole = getUserRoleFromToken(token);

        validateUserRole(userRole, requiredRole, res, next);
    } catch (error) {
        return res.status(401).json({
            msg: errorMessages.invalidToken,
        });
    }
};

const extractToken = (req: Request): string => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        throw new Error(errorMessages.tokenNotProvided);
    }

    return token;
};

const getUserRoleFromToken = (token: string): string => {
    const decodedToken: any = jwt.verify(token, process.env.SECRET_KEY || 'pepito123');
    return decodedToken.rol;
};

const validateUserRole = (userRole: string, requiredRole: string, res: Response, next: NextFunction) => {
    if (userRole === requiredRole || userRole === 'admin') {
        // Si el rol es válido, se permite el acceso a la ruta protegida
        next();
    } else {
        return res.status(403).json({
            msg: errorMessages.accessDenied,
        });
    }
};

export default validateRole;
