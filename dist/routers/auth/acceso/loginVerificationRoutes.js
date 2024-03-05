"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginController_1 = require("../../../controllers/auth/acceso/loginController");
const router = (0, express_1.Router)();
/**
 * POST /api/user/login
 *  Ruta para que los usuarios inicien sesión.
 *  Público
 */
router.post('/login', loginController_1.loginUser);
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
exports.default = router;
