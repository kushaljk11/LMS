import Book from '../model/book.js';

// ➕ Add Book
export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, quantity, availableBooks, publishedYear, category } = req.body;

    if (!title || !author || !isbn || !quantity || !availableBooks) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (title.length < 3 || author.length < 3) {
      return res.status(400).json({ message: 'Title and Author must be at least 3 characters long' });
    }
    if (quantity <= 0 || availableBooks < 0) {
      return res.status(400).json({ message: 'Quantity and Available Books must be positive' });
    }
    if (quantity < availableBooks) {
      return res.status(400).json({ message: 'Available Books cannot be more than Quantity' });
    }

    const newBook = new Book({
      title,
      author,
      isbn,
      quantity,
      availableBooks,
      publishedYear,
      category
    });

    await newBook.save();
    res.status(201).json({ message: 'Book created successfully', book: newBook });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 📚 Get All Books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 📖 Get Book by ISBN
export const getBookByIsbn = async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✏️ Update Book
export const updateBook = async (req, res) => {
  try {
    const { isbn } = req.params;
    const { title, author, quantity, availableBooks } = req.body;

    const book = await Book.findOneAndUpdate(
      { isbn },
      { title, author, quantity, availableBooks, updatedAt: Date.now() },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book updated successfully', book });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🗑 Delete Book
export const deleteBook = async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = await Book.findOneAndDelete({ isbn });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book deleted successfully', book });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// // 📥 Borrow Book
// export const borrowBook = async (req, res) => {
//   try {
//     const { bookId } = req.body;
//     const book = await Book.findById(bookId);

//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     if (book.availableBooks <= 0) {
//       return res.status(400).json({ message: 'No copies available' });
//     }

//     book.availableBooks -= 1;
//     await book.save();

//     res.status(200).json({ message: 'Book borrowed successfully', book });
//   } catch (error) {
//     console.error('Error borrowing book:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // 📤 Return Book
// export const returnBook = async (req, res) => {
//   try {
//     const { bookId } = req.body;
//     const book = await Book.findById(bookId);

//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }

//     book.availableBooks += 1;
//     await book.save();

//     res.status(200).json({ message: 'Book returned successfully', book });
//   } catch (error) {
//     console.error('Error returning book:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };