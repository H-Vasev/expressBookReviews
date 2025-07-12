const express = require("express");
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

  const isExist = users.find((u) => u.username === username);
  if (isExist) {
    return res
      .status(400)
      .json({ message: "User with the provided name is already exist!" });
  }

  users.push({ username, password });

  return res
    .status(200)
    .json({ message: `User with username: ${username}, registered successfully!` });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const id = req.params.isbn;
  const book = books[id];

  if (!book) {
    return res
      .status(400)
      .send({ message: `Book with the provided id: ${id} does not exist` });
  }

  return res.status(200).send(JSON.stringify(book, null, 2));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const authName = req.params.author;

  const bookKeys = Object.keys(books).filter(
    (key) => books[key].author === authName
  );

  if (bookKeys.length < 1) {
    return res
      .status(400)
      .send({
        message: `Book with provided Author: ${authName} does not exist!`,
      });
  }

  const result = bookKeys.map((key) => books[key]);
  return res.status(200).send(JSON.stringify(result, null, 2));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const bookTitle = req.params.title;

  const bookKey = Object.keys(books).find(key => books[key].title === bookTitle)

  if(!bookKey){
    return res.status(400).send({message: `Book with provided title: ${bookTitle}, does not exist!`})
  }

  return res.status(200).send(JSON.stringify(books[bookKey], null, 2))
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const id = req.params.isbn;
  const book = books[id]

  if(!book){
    return res.status(400).send({message: "The book is not defined"})
  }

  const reviews = book.reviews
  if(Object.keys(reviews).length === 0){
    return res.status(400).send({message: "The book does not have any reviews yet!"})
  }

  return res.status(200).send(JSON.stringify(reviews, null, 2))
});

module.exports.general = public_users;
