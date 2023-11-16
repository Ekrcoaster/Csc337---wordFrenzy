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
const port = 5001;

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
//app.use(cookieParser);
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

// active game requests

// todo, allow game settings to be created
app.post("/activeGame/createGame", (req, res) => {
    res.json(GAME.CreateGame());
});

app.post("/activeGame/addPlayer", (req, res) => {
    res.json(GAME.AddPlayer(req.body.username));
});

app.post("/activeGame/start", (req, res) => {
    res.json(GAME.StartGame());
});

app.get("/activeGame/getGame", (req, res) => {
    res.json(GAME.GetGame());
});

app.post("/activeGame/submit", (req, res) => {
    res.json(GAME.Submit(req.body.username, req.body.submission));
});


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