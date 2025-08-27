import express from "express";
import { borrowBook, returnBook, borrowHistory, allBorrowRecords, deleteBorrowers } from "../controller/borrow.controller.js";
import { verifyToken, authorizationRoles } from "../middleware/verify.token.js";
import { getAllBorrowers } from "../controller/borrow.controller.js";

const router = express.Router();

router.post("/borrow", verifyToken, authorizationRoles("Borrower", "Librarian"), borrowBook);
router.post("/borrow/return/:borrowId", verifyToken, authorizationRoles("Borrower", "Librarian"), returnBook);
router.get("/borrow/history", verifyToken, borrowHistory);
router.get("/borrow/all-records", verifyToken, authorizationRoles("Librarian"), allBorrowRecords);
router.get("/allborrowers",verifyToken, authorizationRoles("Librarian"), getAllBorrowers);
router.delete("/deleteborrowers/:id",verifyToken, authorizationRoles("Librarian"),deleteBorrowers);


export default router;
