import express from "express";
import {addBook,getAllBooks,getBookByIsbn,updateBook,deleteBook} from "../controller/book.controller.js";
import { authorizationRoles, verifyToken } from "../middleware/verify.token.js";

const router = express.Router();

router.post("/books",verifyToken,authorizationRoles('Librarian'), addBook);
router.get("/book",verifyToken,authorizationRoles('Librarian'), getAllBooks);
router.get("/books/:isbn",verifyToken,authorizationRoles('Librarian'), getBookByIsbn);
router.put("/book/:isbn",verifyToken,authorizationRoles('Librarian'), updateBook);
router.delete("/books/:isbn",verifyToken,authorizationRoles('Librarian'), deleteBook);

export default router;