
import express from 'express';
import validateToken from '../../../../middleware/validateToken/validateToken';
import validateRole from '../../../../middleware/validateRole/validateRole';


const router = express.Router();



/**
 *  GET /api/user/user
 *  Ruta protegida para los usuarios normales.
 *  Privado (solo para usuarios con rol 'user')
 */
router.get('/user', validateToken, validateRole('user'), (req, res) => {
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

export default router;
