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
}

setInterval(removeSessions, 2000);

const app = express();
const port = 80;

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
  if (c != null && c.login != null) {
    if (sessions[c.login.username] != null &&
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
//    Category requests
// ------------------------

// creates a category
app.post("/create/category", function (req, res) {

  let words = [];
  let points = [];

  let array = req.body.cWords.split(",");
  for (var i = 0; i < array.length; i++) {
    if (i % 2 == 0) {
      words.push(array[i].toLowerCase().trim());
    } else { points.push(parseInt(array[i].trim())) };
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

// deletes a word from a category
app.get('/delete/words/:category/:word', function (req, res) {
  DATABASE.DeleteWordCategory({ title: req.params.category }, req.params.word).then(() => {
	res.end('word deleted if word was in the database');
  }).catch((error) => {
    console.log('Save failed');
    console.log(error);
    res.end('Category Failed!');
  });
});

// adds a word to a category
app.get('/add/words/:category/:word', function (req, res) {
  DATABASE.AddWordCategory({ title: req.params.category }, req.params.word).then(() => {
    res.end('Word Added');
  }).catch((error) => {
    console.log('Save failed');
    console.log(error);
    res.end('Category Failed!');
  });
});

// deletes a category
app.get('/delete/:category', function (req, res) {
  DATABASE.FindAndDeleteCategory({ title : req.params.category }).then(() => {
	console.log("Category Deleted");
  }).catch( (error) => {
    console.log(error);
    res.end('Get Category Fail');
  });
});

// ------------------------
//    Login requests
// ------------------------

app.post('/account/login', (req, res) => {
  let u = req.body;
  DATABASE.FindUser(u.username, u.password).then((results) => {
    if (results.length == 0) {
      res.end('Coult not find account');
    } else {
      let sid = addSession(u.username);
      res.cookie("login",
        { username: u.username, sessionID: sid },
        { maxAge: 1000 * 60 * 10 });
      res.end('SUCCESS');
    }
  });
});

app.post('/account/logout', (req, res) => {
  let name = req.cookies?.login?.username;
  if(name == null) {
    res.json({error: "Account doesn't exist"});
  } else {
    delete sessions[name];
    res.json({ok: true});
  }
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

// ------------------------
//    Achievement requests
// ------------------------

app.get('/account/achievement', (req, res) => {
  let name = req.cookies.login.username;
  DATABASE.FindUserJustUsername(name).then((results) => {
    if (results.length == 0) {
      res.end('Coult not find account');
    } else {
	  console.log(results);
      let achieves = results[0].achievements;
	  let done = "";
	  for (var i = 0; i < achieves.length; i++) {
		if (achieves[i].achieved == 1) {
			if (done != "") {
				done += "!";
			}
			done += achieves[i].name;
		}
	  }
	  res.end(done);
    }
  });
});

// adds data for user achievements
app.get('/add/achievement/:submissions', function (req, res) {
	let name = req.cookies.login.username;
  DATABASE.UpdateAchievement(name, { submissions: req.params.submissions }).then(() => {
    res.end('Achievement Checked');
  }).catch((error) => {
    console.log('Save failed');
    console.log(error);
    res.end('Category Failed!');
  });
});
// ------------------------
//    LeaderBoard requests
// ---

app.get("/leaderboard/get", (req, res) => {
  DATABASE.GetLeaderboard().then((leaderboard) => {
    res.json({ leaderboard: leaderboard });
  }).catch((err) => {
    res.json({ error: err });
  });
});
