
import { Router } from "express";
import { loginUser } from "../../../controllers/auth/acceso/loginController";

const router = Router();

/**
 * POST /api/user/login
 *  Ruta para que los usuarios inicien sesión.
 *  Público
 */ 
router.post('/login', loginUser);

// /**
//  *  GET /api/user/admin
//  *  Ruta protegida para los administradores.
//  *  Privado (solo para usuarios con rol 'admin')
//  */
// router.get('/admin', validateToken, validateRole('admin'), (req, res) => {
//     res.send('Bienvenido, eres un administrador');
// });

// /**
//  *  GET /api/user/user
//  *  Ruta protegida para los usuarios normales.
//  *  Privado (solo para usuarios con rol 'user')
//  */
// router.get('/user', validateToken, validateRole('user'), (req, res) => {
//     res.send('Bienvenido, eres un usuario normal');
// });

export default router;
