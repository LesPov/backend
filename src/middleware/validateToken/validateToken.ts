import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '../errorMessages';

interface CustomRequest extends Request {
    user?: {
        userId: number;
        rol: string;
        // Agrega otras propiedades según sea necesario
    };
}

const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const headerToken = req.headers['authorization'];

    try {
        checkTokenPresenceAndFormat(headerToken);
        const bearerToken = extractBearerToken(headerToken as string);
        const decodedToken = verifyTokenAndGetUser(bearerToken);

        attachUserInfoToRequest(req, decodedToken);
        next();
    } catch (error) {
        handleTokenVerificationError(error, res);
    }
};

const checkTokenPresenceAndFormat = (headerToken: string | undefined) => {
    if (!headerToken || !headerToken.startsWith('Bearer ')) {
        throw new Error(errorMessages.accessDeniedNoToken);
    }
};

const extractBearerToken = (headerToken: string) => {
    return headerToken.slice(7);
};

const verifyTokenAndGetUser = (bearerToken: string): any => {
    return jwt.verify(bearerToken, process.env.SECRET_KEY || 'pepito123');
};

const attachUserInfoToRequest = (req: CustomRequest, decodedToken: any) => {
    req.user = decodedToken;
};

const handleTokenVerificationError = (error: any, res: Response) => {
    res.status(401).json({
        msg: errorMessages.invalidToken,
    });
};

export default validateToken;
