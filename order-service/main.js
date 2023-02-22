const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Order = require("./model/Order");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const isAuthenticated = require("../auth.js");
// middlewares
app.use(express.json());

var channel, connection;

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/order", () => {
  console.log("Order Service connected to DB");
});

async function connect() {
  try {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(`${amqpServer}`);
    channel = await connection.createChannel();
    await channel.assertQueue("Order");

  } catch (error) {
    console.log(error);
  }
}

connect().then(() => {
    channel.consume("Order", data => {
        const { products, userEmail } = JSON.parse(data.content);
        console.log("Order consumed")
        console.log(`Order placed for ${userEmail} with products ${products}`);
    })
})



//port
const Port = process.env.PORT || 7090;

app.listen(Port, () => {
  console.log(`Order service listening on port ${Port}`);
});
