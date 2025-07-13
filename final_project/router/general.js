const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are not provided!" });
  }

  if (!isValid(username)) {
    return res.status(400).send({ message: "Invalid username" });
  }

  const isExist = users.find((u) => u.username === username);
  if (isExist) {
    return res
      .status(400)
      .json({ message: "User with the provided name is already exist!" });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: `User with username: ${username}, registered successfully!`,
  });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Books not found");
      }
    });
  };

  try {
    const bookList = await getBooks();
    res.status(200).send(JSON.stringify(bookList, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Error getting books", error });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  };

  getBookByISBN(isbn)
    .then((book) => {
      res.status(200).send(JSON.stringify(book, null, 2));
    })
    .catch((err) => {
      res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found.`, error: err });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
 const author = req.params.author;

  const findBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const matches = Object.keys(books)
        .filter((key) => books[key].author === author)
        .map((key) => books[key]);

      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(`No books found for author: ${author}`);
      }
    });
  };

  findBooksByAuthor(author)
    .then((result) => {
      res.status(200).send(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
const title = req.params.title;
 
  const findBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const matches = Object.keys(books)
        .filter((key) => books[key].title === title)
        .map((key) => books[key]);

      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(`No books found for title: ${title}`);
      }
    });
  };

  findBooksByTitle(title)
    .then((result) => {
      res.status(200).send(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const id = req.params.isbn;
  const book = books[id];

  if (!book) {
    return res.status(400).send({ message: "The book is not defined" });
  }

  const reviews = book.reviews;
  if (Object.keys(reviews).length === 0) {
    return res
      .status(400)
      .send({ message: "The book does not have any reviews yet!" });
  }

  return res.status(200).send(JSON.stringify(reviews, null, 2));
});

module.exports.general = public_users;
