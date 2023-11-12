/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the main server code
 */

const GAME = require("./game");
GAME.Start();

// --------------
//   THE SERVER
// --------------
const express = require("express");
const app = express();
const port = 50;

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(cookieParser);
app.use("/app/*", handleLockedPage);
app.use(express.static(__dirname + "/public_html/"));

app.listen(port, () => {
    console.log(`Server started at port ${port}!`);
});

/**
 * This function will check if the person is logged in to access
 */
function handleLockedPage(req, res, next) {
    next();
}




// --------------
// THE DATABASE
// --------------

const mongoose = require("mongoose");
const mongoDBURL = "mongodb://127.0.0.1:27017/wordFrenzy";
mongoose.connect(mongoDBURL);
mongoose.connection.on('error', () => {
    console.log('Connection Error')
});
mongoose.connection.on("open", () => {
    console.log("Database Connected");
});