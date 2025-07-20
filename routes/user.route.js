import express from 'express';
import { verifyToken, authorizationRoles } from '../middleware/verify.token.js';
import { loginUser, registerUser } from '../controller/user.controller.js';

const router = express.Router();

router.post('/register',registerUser);
router.get('/login',loginUser)

export default router;