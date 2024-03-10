// Importación de módulos necesarios desde Express y JSON Web Token (JWT)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '../errorMessages';

// Definición de la interfaz CustomRequest que extiende la interfaz Request de Express
interface CustomRequest extends Request {
    user?: {
        userId: number;
        rol: string;
        // Agrega otras propiedades según sea necesario
    };
}

// Middleware para validar el token de autenticación
const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    // Obtención del token del encabezado de la solicitud
    const headerToken = req.headers['authorization'];

    try {
        // Verificación de la presencia y formato correcto del token en el encabezado
        checkTokenPresenceAndFormat(headerToken);
        
        // Extracción del token Bearer
        const bearerToken = extractBearerToken(headerToken as string);

        // Verificación del token y obtención de la información del usuario
        const decodedToken = verifyTokenAndGetUser(bearerToken);

        // Adjuntar la información del usuario a la solicitud
        attachUserInfoToRequest(req, decodedToken);

        // Continuar con el siguiente middleware o ruta
        next();
    } catch (error) {
        // Manejo de errores durante la verificación del token
        handleTokenVerificationError(error, res);
    }
};

// Función para verificar la presencia y formato correcto del token
const checkTokenPresenceAndFormat = (headerToken: string | undefined) => {
    if (!headerToken || !headerToken.startsWith('Bearer ')) {
        throw new Error(errorMessages.accessDeniedNoToken);
    }
};

// Función para extraer el token Bearer del encabezado
const extractBearerToken = (headerToken: string) => {
    return headerToken.slice(7);
};

// Función para verificar el token y obtener la información del usuario
const verifyTokenAndGetUser = (bearerToken: string): any => {
    return jwt.verify(bearerToken, process.env.SECRET_KEY || 'pepito123');
};

// Función para adjuntar la información del usuario a la solicitud
const attachUserInfoToRequest = (req: CustomRequest, decodedToken: any) => {
    req.user = decodedToken;
};

// Función para manejar errores durante la verificación del token
const handleTokenVerificationError = (error: any, res: Response) => {
    res.status(401).json({
        msg: errorMessages.invalidToken,
    });
};

// Exportar el middleware para su uso en otras partes de la aplicación
export default validateToken;
