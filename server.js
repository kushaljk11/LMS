import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import bookRoutes from './routes/book.route.js';
import userRoutes from './routes/user.route.js';
import borrowRoutes from './routes/borrow.route.js';
import moongoose from 'mongoose';

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", bookRoutes);
app.use("/api", borrowRoutes);
app.use("/api", userRoutes);

app.listen(PORT, () => {
    console.log(`The server is running on \`http://localhost:${PORT}\``);
});