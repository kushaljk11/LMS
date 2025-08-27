import Borrow from "../model/borrow.js";
import Book from "../model/book.js";
import mongoose from "mongoose";
import user from "../model/user.js";

export const borrowBook = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookId } = req.body;

    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res
        .status(400)
        .json({ message: "Sorry, Book ID is invalid or missing" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Sorry, Book not found" });
    }

    if (book.availableBooks <= 0) {
      return res
        .status(400)
        .json({ message: "Sorry, No available copies of the book" });
    }

    const existingBorrow = await Borrow.findOne({
      userId,
      bookId,
      returnDate: null,
    });

    if (existingBorrow) {
      return res
        .status(400)
        .json({ message: "Sorry, You have already borrowed this book" });
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);

    const newBorrow = new Borrow({
      userId,
      bookId,
      borrowDate,
      dueDate,
    });

    await newBorrow.save();

    book.availableBooks -= 1;
    await book.save();

    res
      .status(201)
      .json({
        message: "Yayyy.... Book borrowed successfully",
        borrow: newBorrow,
      });
  } catch (error) {
    console.error("Oops, Error borrowing book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res
        .status(404)
        .json({ message: "Sorry, Borrow record not found" });
    }

    if (borrow.returnDate !== null) {
      return res
        .status(400)
        .json({ message: "Sorry, Book has already been returned" });
    }
    borrow.returnDate = Date.now();
    await borrow.save();

    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableBooks += 1;
      await book.save();
    }

    res
      .status(200)
      .json({ message: "Thankyou..., Book returned successfully", borrow });
  } catch (error) {
    console.error("Oops, Error returning book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const borrowHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const borrows = await Borrow.find({ userId })
      .populate("bookId", "title author image")
      .sort({ borrowDate: -1 });

    res
      .status(200)
      .json({ message: "Borrow history retrieved successfully", borrows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const allBorrowRecords = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate("bookId", "title author isbn category")
      .populate("userId", "name email")
      .sort({ borrowDate: -1 });

    // Filter out records missing book or user
    const validBorrows = borrows.filter(b => b.bookId !== null && b.userId !== null);

    res.status(200).json({
      message: "All borrower records retrieved",
      borrows: validBorrows.map(b => ({
        _id: b._id,
        bookId: b.bookId,
        userId: b.userId,
        borrowDate: b.borrowDate,
        returnDate: b.returnDate,
        dueDate: b.dueDate,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllBorrowers = async (req, res) => {
  try {
    // Fetch all borrowers
    const users = await user.find({ role: "Borrower" });

    const result = await Promise.all(
      users.map(async (user) => {
        // Fetch all borrows for this user
        const borrows = await Borrow.find({ userId: user._id })
          .populate("bookId", "title") // populate book title
          .lean();

        // Map borrowed books safely
        const borrowedBooks = borrows.map((b) => ({
          title: b.bookId?.title || "Untitled Book",
          borrowDate: b.borrowDate,
          dueDate: b.dueDate,
          returned: !!b.returnDate,
        }));

        const totalLoans = borrows.length;
        const activeLoans = borrows.filter((b) => !b.returnDate).length;
        const overdue = borrows.filter(
          (b) => !b.returnDate && new Date(b.dueDate) < new Date()
        ).length;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          totalLoans,
          activeLoans,
          overdue,
          borrowedBooks,
        };
      })
    );

    res.status(200).json({ borrowers: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteBorrowers = async (req, res) => {
  try {
    const { id } = req.params; // match frontend `/deleteborrowers/:id`

    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if user exists
    const existingUser = await user.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    // Check for active borrowings
    const activeBorrows = await Borrow.find({ userId: id, returnDate: null });
    if (activeBorrows.length > 0) {
      return res.status(400).json({
        message: "Cannot delete borrower with active borrowed books",
      });
    }

    // Delete all borrow records for this user
    await Borrow.deleteMany({ userId: id });

    // Delete the user
    await user.findByIdAndDelete(id);

    res.status(200).json({ message: "Borrower deleted successfully" });
  } catch (error) {
    console.error("Error deleting borrower:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
