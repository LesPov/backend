"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateToken_1 = __importDefault(require("../../../middleware/validateToken/validateToken"));
const validateRole_1 = __importDefault(require("../../../middleware/validateRole/validateRole"));
const router = express_1.default.Router();
/**
 *  GET /api/user/user
 *  Ruta protegida para los usuarios normales.
 *  Privado (solo para usuarios con rol 'user')
 */
router.get('/user', validateToken_1.default, (0, validateRole_1.default)('user'), (req, res) => {
    res.send('Bienvenido, eres un usuario normal');
});
// /**  
//  * GET /api/user/admin/profile/:userId
//  * Ruta protegida para obtener el perfil de un usuario por su ID.
//  * Privado (solo para usuarios con rol 'admin')
//  */
// router.get('/profile/:userId', validateToken, (req, res) => {
//   getUserProfile(req, res);
// });
// router.put('/profile/:userId', validateToken, (req, res) => {
//   updateUserProfile(req, res);
// });
exports.default = router;
