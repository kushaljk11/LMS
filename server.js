import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import bookRouter from './routes/book.route.js';
import userRouter from './routes/user.route.js';
import borrowRouter from './routes/borrow.route.js';
import moongoose from 'mongoose';
import cors from 'cors'

const app = express();

dotenv.config();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],'https://lms-frontend-97nkcmton-jkhos-projects-68efcde1.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(express.json())
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  console.log('Database is connected successfully')
}).catch(err => {
  console.error('Database connection failed!!:', err)
})

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from the server"
  })
})

app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Hello from the server"
  })
})


app.use("/api", bookRouter);
app.use("/api", borrowRouter);
app.use("/api", userRouter);

app.listen(PORT, () => {
    console.log(`The server is running on \`http://localhost:${PORT}\``);
});
