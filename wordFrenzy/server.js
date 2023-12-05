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
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = { id: sid, time: now };
  return sid;
}

function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    //20 min
    if (last + 1200000 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

setInterval(removeSessions, 2000);

const app = express();
const port = 5001;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
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
  let c = req.cookies;
  console.log('auth request:');
  console.log(req.cookies);
  if (c != undefined && c.login != undefined) {
    if (sessions[c.login.username] != undefined &&
      sessions[c.login.username].id == c.login.sessionID) {
      next();
    } else {
      res.redirect('/index.html');
    }
  } else {
    res.redirect('/index.html');
  }
}



// ------------------------
//   Active Game Requests
// ------------------------

app.post("/activeGame/addPlayer", (req, res) => {
  res.json(GAME.AddPlayer(req.body.username));
});

app.post("/activeGame/start", (req, res) => {
  res.json(GAME.StartGame());
});

app.get("/activeGame/getGame", (req, res) => {
  if(!GAME.GameExists()) {
    GAME.CreateGame().then((result) => {
      res.json(result); 
    }).catch((err) => {
      res.json({"error": "Failed to create game: " + err});
    });
  } else {
    res.json(GAME.GetGame());
  }
});

app.post("/activeGame/submit", (req, res) => {
  res.json(GAME.Submit(req.body.username, req.body.submission));
});


// ------------------------
//    Past Game Requests
// ------------------------

app.get("/pastGames/get/:USERNAME", (req, res) => {
  DATABASE.GetPastGames(req.params.USERNAME).then((games) => {
    res.json({ games: games });
  }).catch((err) => {
    res.json({ error: err });
  });
});


// ------------------------
//    Category equests
// ------------------------

// creates a category
app.post("/create/category", function (req, res) {

  let words = [];
  let points = [];

  let array = req.body.cWords.split(",");
  for (var i = 0; i < array.length; i++) {
    if (i % 2 == 0) {
      words.push(array[i]);
    } else { points.push(parseInt(array[i])) };
  }

  DATABASE.CreateCategory(req.body.cTitle, req.body.cDescription, words, points).then((response) => {
    console.log('Saved successfully');
    res.end('Category Created');
  }).catch((error) => {
    console.log('Save failed');
    console.log(error);
    res.end('Category Failed!');
  });
});

// gets all the categories in the database
app.get('/get/categories', function (req, res) {
  DATABASE.GetCustomCategories().then((response) => {
    let html = "";
    if (response.length != 0) {
      for (var i = 0; i < response.length; i++) {
        html += '<button class="categories" onclick="displayWords(this)" name="' + response[i].title + '">' + response[i].title + '</button>';
      }
    }
    res.end(html);
  }).catch((error) => {
    console.log(error);
    res.end('Get Categories Fail');
  })
});

// gets all the words in a specific category
app.get('/get/words/:category', function (req, res) {
  DATABASE.GetCustomCategories({ title: req.params.category }).then((response) => {
    let html = "";
    let words = response[0].words;
    let points = response[0].points;
    for (var i = 0; i < words.length; i++) {
      html += '<p class="words">' + words[i] + ': ' + points[i] + ' points' + '</p>';
    }
    res.end(html);
  }).catch((error) => {
    console.log(error);
    res.end('Get Words Fail');
  })
});

// ------------------------
//    Login requests
// ------------------------

app.post('/account/login', (req, res) => {
  console.log(sessions);
  let u = req.body;
  DATABASE.FindUser(u.username, u.password).then((results) => {
    if (results.length == 0) {
      res.end('Coult not find account');
    } else {
      let sid = addSession(u.username);
      res.cookie("login",
        { username: u.username, sessionID: sid },
        { maxAge: 60000 * 2 });
      res.end('SUCCESS');
    }
  });
});

app.get('/account/create/:user/:pass', (req, res) => {
  DATABASE.FindUserJustUsername(req.params.user).then((results) => {
    if (results.length == 0) {
      DATABASE.CreateUser(req.params.user, req.params.pass).then(() => {
        res.end('USER CREATED');
      }).catch(() => {
        res.end('DATABASE SAVE ISSUE');
      });
    } else {
      res.end('USERNAME ALREADY TAKEN');
    }
  });

});

app.get('/account/getName', (req, res) => {
  let name = req.cookies.login;
  res.send(name);
});