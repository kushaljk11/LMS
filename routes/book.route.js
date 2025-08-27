import express from "express";
import {addBook,getAllBooks,getBookByIsbn,updateBook,deleteBook} from"../controller/book.controller.js";
import { authorizationRoles, verifyToken } from "../middleware/verify.token.js";

const router = express.Router();

router.post("/book",verifyToken,authorizationRoles('Librarian'), addBook);
// router.post("/book",verifyToken, addBook);

router.get("/books",verifyToken,authorizationRoles('Librarian', 'Borrower'), getAllBooks);
// router.get("/books",verifyToken, getAllBooks);

router.get("/books/:isbn",verifyToken,authorizationRoles('Librarian'), getBookByIsbn);
router.put("/book/:isbn",verifyToken,authorizationRoles('Librarian'), updateBook);
router.delete("/books/:isbn",verifyToken,authorizationRoles('Librarian'), deleteBook);

//for borrower
// router.post("/borrow", borrowBook);


export default router;