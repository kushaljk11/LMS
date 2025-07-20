import Borrow from '../model/borrow.js';
import Book from '../model/book.js';

export const borrowBook = async (req, res) => {
  try {
    const userId = req.user._id; 
    const {bookId}= req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'Sorry, Book ID is required' });
    }
    const  book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Sorry, Book not found' });
    }
    if(book.availableBooks <=0){
      return res.status(400).json({ message: 'Sorry, No available copies of the book' });

    }
    const existingBorrow = await Borrow.findOne({
      userId,
      bookId,
      returnDate: null, 

    })
    if (existingBorrow) {
      return res.status(400).json({ message: 'Sorry, You have already borrowed this book' });
    }

    const newBorrow = new Borrow({
      userId,
      bookId
    })

    await newBorrow.save();

    book.availableBooks -= 1;
    await book.save();

    res.status(201).json({ message: 'Yayyy.... Book borrowed successfully', borrow: newBorrow });

  }catch (error) {
    console.error('Oops, Error borrowing book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({ message: 'Sorry, Borrow record not found' });
    }

    if(borrow.returnDate !==null){
      return res.status(400).json({ message: 'Sorry, Book has already been returned' });
    }
    borrow.returnDate = Date.now();
    await borrow.save();

    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableBooks += 1;
      await book.save();
    }
    
    res.status(200).json({ message: 'Thankyou..., Book returned successfully', borrow });
  } catch (error) {
    console.error('Oops, Error returning book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const borrowHistory = async (req, res) => {
  try {
    const userId = req.user._id; 
    const borrows = await Borrow.find({ userId }).populate('bookId', 'title author isbn');

    if (borrows.length === 0) {
      return res.status(404).json({ message: 'Sorry, No borrow history found' });
    }

    res.status(200).json({ message: 'Yayyy.... Borrow history retrieved successfully', borrows });
  } catch (error) {
    console.error('Oops, Error retrieving borrow history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}