import express from 'express';
import { verifyToken, authorizationRoles } from '../middleware/verify.token.js';
import { loginUser, registerUser } from '../controller/user.controller.js';
import { getDashboard } from '../controller/user.controller.js';
import { addMember} from '../controller/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', verifyToken, getDashboard);


router.post('/members', verifyToken, addMember);




export default router;