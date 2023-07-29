//jshint esversion:6
require('dotenv').config();
const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require ("mongoose-encryption");

const app = express();

app.use(express.static("publc"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
        extended:true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");
const db = mongoose.connection;
db.on("error", err => {
  console.error("Error connecting to MongoDB:", err.message);
});
db.once("open", () => {
  console.log("Connected to MongoDB!");
});
 
const userSchema = new mongoose.Schema ({
    email:String,
    password:String
});



userSchema.plugin(encrypt,{ secret:process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});



app.post("/register",function(req,res){
    const newUser = new User({
            email:req.body.username,
            password:req.body.password
    });
    newUser.save().then(function(){
        res.render("secrets");
    }).catch(function(err){
        res.send(err);
    });
});

app.post("/login",async function(req,res){
    const username=req.body.username;
    const password=req.body.password;

    try {
        const foundUser = await User.findOne({ email: username }).exec();
        if (foundUser && foundUser.password === password) {
          res.render("secrets");
        } else {
          // Handle the case where user not found or incorrect password
          res.send("Invalid credentials");
        }
      } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
      }
});

app.listen(3000,function(){
    console.log("App is Running on port 3000");
});