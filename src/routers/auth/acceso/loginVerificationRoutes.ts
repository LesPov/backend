
import { Router } from "express";
import { loginUser } from "../../../controllers/auth/acceso/loginController";
import validateToken from "../../../middleware/validateToken/validateToken";
import validateRole from "../../../middleware/validateRole/validateRole";

const router = Router();

/**
 * POST /api/user/login
 *  Ruta para que los usuarios inicien sesión.
 *  Público
 */ 
router.post('/login', loginUser);
/**
 *  GET /api/user/user
 *  Ruta protegida para los usuarios normales.
 *  Privado (solo para usuarios con rol 'user')
 */
router.get('/user', validateToken, validateRole('user'), (req, res) => {
    res.send('Bienvenido, eres un usuario normal');
});

export default router;
 