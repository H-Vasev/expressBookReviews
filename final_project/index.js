const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

    const token = req.session.authorization?.accessToken;

    if(!token){
        return res.status(400).send({message: "Access denied!"})
    }

    jwt.verify(token, "secret_key", (err, decode) => {
        if(err){
            return res.status(400).send({message: "Invalid token"})
        }

        req.user = decode
        next()
    })
});
 
const PORT =5000; 

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
