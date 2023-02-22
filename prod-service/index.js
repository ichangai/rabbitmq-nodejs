const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Product = require("./model/Product");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const isAuthenticated = require("../auth.js");
// middlewares
app.use(express.json());

var channel, connection;

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/product", () => {
  console.log("Product Service connected to DB");
});


async function connect() {
    try {
        const amqpServer = "amqp://localhost:5672";
        connection = await amqp.connect(`${amqpServer}`);
        channel = await connection.createChannel();
        await channel.assertQueue("Product");

    } catch (error) {
        console.log(error);
    }
}

connect();

// create product
app.post("/product", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const product = new Product({
    name,
    description,
    price,
  });
  await product.save();

  // channel.sendToQueue("Product", Buffer.from(JSON.stringify(product)));
  return res.status(200).json({
    message: "Product created successfully",
    product,
  });
});

app.post("/product/buy", isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    
    channel.sendToQueue("Order", Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email
    })));
    
//   return res.status(200).json({
//     message: "Product created successfully",
//     product,
//   });
});


//port
const Port = process.env.PORT || 7080;

app.listen(Port, () => {
  console.log(`Product service listening on port ${Port}`);
});
