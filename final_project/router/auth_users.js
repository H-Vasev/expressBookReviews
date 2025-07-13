const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return typeof username === "string" && username.length > 3;
};

const authenticatedUser = (username, password) => {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are not provided!" });
  }

  const currentUser = users.find((u) => u.username === username);

  if (!currentUser) {
    return res
      .status(400)
      .send({
        message: `User with provided username: ${username}, does not exist!`,
      });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).send({ message: "Invalid credentials!" });
  }

  const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });

  req.session.authorization = {
    accessToken,
    username,
  };

  return res
    .status(200)
    .send({ message: "Login successful.", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const bookForReview = books[req.params.isbn];

  if (!bookForReview) {
    return res
      .status(400)
      .send({ message: "The provided book does not exist!" });
  }

  const currUser = req.session.authorization?.username

  if(!currUser){
    return res.status(400).send({message: "Must be logged in to submit a review!"})
  }

  const review = req.body.review;
   if(!review){
    return res.status(400).send({message: "The review message is a must!"})
  }
  
  bookForReview.reviews[currUser] = review

  return res.status(200).send({message:"The review is added successfully", bookForReview})
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn]

  if(!book){
    return res.status(400).send({message: "The book does not exist!"})
  }

  const currUser = req.session.authorization?.username
  if(!currUser){
    return res.status(400).send({message: "You must login to delete a review!"})
  }

  if(!book.reviews[currUser]){
    return res.status(400).send({message: "There is no review form this user!"})
  }

  delete book.reviews[currUser]

  return res.status(200).send({message: `Review by: ${currUser}, was successfully deleted!`, book})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
