const express = require("express");
const mongoose = require("mongoose");
const app = express();
const User = require("./model/User");
const jwt = require("jsonwebtoken");

// middlewares
app.use(express.json());

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/auth", () => {
    console.log("Auth Service connected to DB");
});

// routes
app.get("/", (req, res) => {
    res.send("Auth Service started successfully");
});


// Register 
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).send("User already exists");
  }

  const newUser = new User({
    name,
    email,
    password,
  });

  await newUser.save();
  return res.status(200).json({
    message: "User created successfully",
    user: newUser,
  });
});

// login

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).send("User does not exist");
    }

    if (user.password !== password) {
        return res.status(400).send("Invalid password");
    }
    

    const payload = {
        email,
        name: user.name,
    };

    jwt.sign(payload, "secret", { expiresIn: "1h" }, (err, token) => {
        if (err) {
            return res.status(400).send("Error while generating token");
        } else {
            return res.status(200).json({
                message: "User logged in successfully",
                token: token,
            });
        }
    });
});


//port 
const Port = process.env.PORT || 7070;


app.listen(Port, () => {
    console.log(`Auth service listening on port ${Port}`)
})