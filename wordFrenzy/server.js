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


// ------------------------
//    Category equests
// ------------------------

// creates a category
app.post("/create/category", function(req, res) {
  let newCategory = new DATABASE.Category;

  newCategory.title = req.body.cTitle;
  newCategory.description = req.body.cDescription;
  
  let words = [];
  let points = [];

  let array = req.body.cWords.split(",");
  for (var i = 0; i < array.length; i++) {
	if (i % 2 == 0) {
	  words.push(array[i]);
	} else { points.push(array[i])};
  }
  newCategory.words = words;
  newCategory.points = points;
  
  // saves this new category to the databse
  let p = newCategory.save();
  p.then(() => {
    console.log('Saved successfully');
  });
  p.catch((error) => {
    console.log('Save failed');
    console.log(error);
  });

  res.end('Category Created');
});

// gets all the categories in the database
app.get('/get/categories', function (req, res) {
  let p = new DATABASE.Category.find({}).exec();
  p.then((response) => {
	let html = "";
	if (response.length != 0) {
		for (var i = 0; i < response.length; i++) {
		  html += '<button class="categories" onclick="displayWords(this)" name="'+response[i].title+'">' + response[i].title + '</button>';
		}
	}
    res.end(html);
  });
  p.catch( (error) => {
    console.log(error);
    res.end('Get Categories Fail');
  });
});

// gets all the words in a specific category
app.get('/get/words/:category', function (req, res) {
  let p = new DATABASE.Category.find({ title : req.params.category }).exec();
  
  p.then((response) => {
    let html = "";
    let words = response[0].words;
    let points = response[0].points;
    for (var i = 0; i < words.length; i++) {
      html += '<p class="words">' + words[i] + ': ' + points[i] + ' points' +  '</p>';
    }
    res.end(html);
  });

  p.catch( (error) => {
    console.log(error);
    res.end('Get Words Fail');
  });

});