const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  return typeof username === "string" && username.length > 3
}

const authenticatedUser = (username,password)=>{ 
  const user = users.find((u) => u.username === username && u.password === password);

  if(user){
    return true;
  }else {
    return false
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {  
  const {username, password} = req.body

   if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are not provided!" });
  }

  const currentUser = users.find((u) => u.username === username)

  if(!currentUser){
    return res.status(400).send({message: `User with provided username: ${username}, does not exist!`})
  }

  if(!authenticatedUser(username, password)){
    return res.status(400).send({message: "Invalid credentials!"})
  }

  const accessToken = jwt.sign({username}, "secret_key", {expiresIn: "1h"});

  req.session.authorization = {
    accessToken,
    username
  }

  return res.status(200).send({message: "Login successful.", token: accessToken})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
