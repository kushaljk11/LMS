import User from "../model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Book from "../model/book.js";
import Borrow from "../model/borrow.js";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Sorry, All field are recquired" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Sorry, The user with this email already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Borrower',
    });

    await newUser.save();
    res.status(201).json({ message: "Yayyy.... User registered successfully" });
  } catch (error) {
    console.error("Oops, Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "Sorry, User not found or Invalid email!" });
    }
    const check = bcrypt.compareSync(password, user.password);
    if (!check) {
      return res.status(400).json({ message: "Sorry, Invalid password!" });
    }
    if (user && check) {
      const { password: userPassword, ...userData } = user._doc;
    }
    
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({ message: "Hurray..., Login successful", token, user:{
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } });
  } catch (error) {
    console.error("Oops, Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controller/user.controller.js (add this)
export const getDashboard = async (req, res) => {
  try {
    // Get stats from database
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ status: 'available' });
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', status: 'active' });
    
    // Books issued today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issuedToday = await Borrow.countDocuments({ 
      borrowDate: { $gte: today } 
    });
    
    // Overdue books
    const overdueBooks = await Borrow.countDocuments({ 
      returnDate: null, 
      dueDate: { $lt: new Date() } 
    });
    
    // Recent issues (last 5)
    const recentIssues = await Borrow.find({ returnDate: null })
      .populate('bookId', 'title')
      .populate('userId', 'name')
      .sort({ borrowDate: -1 })
      .limit(5);

    const stats = {
      books: totalBooks,
      availableBooks,
      members: totalMembers,
      activeMembers,
      issuedToday,
      overdueBooks
    };

    const formattedIssues = recentIssues.map(issue => ({
      bookTitle: issue.bookId.title,
      memberName: issue.userId.name,
      date: issue.borrowDate.toLocaleDateString()
    }));

    res.status(200).json({ 
      stats, 
      recentIssues: formattedIssues 
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};

//for adding members books and other in dashboard

export const addBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Failed to add book", error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const member = new User({ ...req.body, role: 'member' });
    await member.save();
    res.status(201).json({ message: "Member added successfully", member });
  } catch (error) {
    res.status(500).json({ message: "Failed to add member", error: error.message });
  }
};

export const addBorrow = async (req, res) => {
  try {
    const borrow = new Borrow(req.body);
    await borrow.save();
    
    // Update book status to borrowed
    await Book.findByIdAndUpdate(req.body.bookId, { status: 'borrowed' });
    
    res.status(201).json({ message: "Book borrowed successfully", borrow });
  } catch (error) {
    res.status(500).json({ message: "Failed to borrow book", error: error.message });
  }
};