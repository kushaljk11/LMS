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

    if (!name || !email || !password || !role) {
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
      role: role === "Borrower" ? "Borrower" : "Librarian",
      address,
      phone
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

export const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      members,
      total: members.length 
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ status: 'available' });
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', status: 'active' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issuedToday = await Borrow.countDocuments({ 
      borrowDate: { $gte: today } 
    });

    const overdueBooks = await Borrow.countDocuments({ 
      returnDate: null, 
      dueDate: { $lt: new Date() } 
    });

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
      bookTitle: issue.bookId?.title || "Unknown Book",
      memberName: issue.userId?.name || "Unknown Member",
      date: issue.borrowDate.toLocaleDateString()
    }));

    res.status(200).json({ 
      stats, 
      recentIssues: formattedIssues 
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};


export const addBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Failed to add book", error: error.message });
  }
};
