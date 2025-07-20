import express from 'express';

import {borrowBook, returnBook, borrowHistory} from '../controller/borrow.controller.js';
import { authorizationRoles, verifyToken } from '../middleware/verify.token.js';

const router = express.Router();

router.post('/borrow',verifyToken,authorizationRoles('Borrower','Librarian'), borrowBook);
router.post('/borrow/return',verifyToken,authorizationRoles('Borrower','Librarian'), returnBook);
router.get('/borrow/history',verifyToken,authorizationRoles('Borrower'), borrowHistory);

export default router;