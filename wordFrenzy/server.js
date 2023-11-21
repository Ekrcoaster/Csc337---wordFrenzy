/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the main server code
 */

const GAME = require("./game");
GAME.Start();

const DATABASE = require("./database");
exports.DATABASE = DATABASE;

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
app.use(express.static(__dirname + "/testing/"));

app.listen(port, () => {
    console.log(`Server started at port ${port}!`);
});

/**
 * This function will check if the person is logged in to access
 */
function handleLockedPage(req, res, next) {
    next();
}

// ------------------------
//   Active Game Requests
// ------------------------

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


// ------------------------
//    Past Game Requests
// ------------------------

app.get("/pastGames/get/:USERNAME", (req, res) => {
    DATABASE.GetPastGames(req.params.USERNAME).then((games) => {
        res.json({games: games});
    }).catch((err) => {
        res.json({error: err}); 
    });
});