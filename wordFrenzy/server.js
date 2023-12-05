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

// define the game category data structure for a round of gameplay
const categorySceme = new mongoose.Schema({
    title: String,
    description: String,
	words: [String],
	points: [Number]
});
const Category = mongoose.model("Category", categorySceme);

// creates a category
app.post("/create/category", function(req, res) {
  let newCategory = new Category;

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
  let p = Category.find({}).exec();
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
  let p = Category.find({ title : req.params.category }).exec();
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

// deletes a word from a category
app.get('/delete/words/:category/:word', function (req, res) {
  let p = Category.find({ title : req.params.category }).exec();
  p.then((response) => {
	let word = req.params.word;
	let words = response[0].words;
	if (words.indexOf(word) > -1) {
		words = words.filter(function(v) {
			return v !== word;
		});
  
		response[0].words = words;
  
	    let p = response[0].save();
	    p.then(() => {
		  console.log('Saved successfully');
	    });
	    p.catch((error) => {
		  console.log('Save failed');
		  console.log(error);
	    });
		res.end('Word Removed');
	
	} else {
		res.end('Word Not In Category');
	}
  });
  p.catch( (error) => {
    console.log(error);
    res.end('Get Category Fail');
  });
});

// adds a word to a category
app.get('/add/words/:category/:word', function (req, res) {
  let p = Category.find({ title : req.params.category }).exec();
  p.then((response) => {
	let word = req.params.word;
	let words = response[0].words;
	
	words.push(word);
	response[0].words = words;

	let p = response[0].save();
	p.then(() => {
	  console.log('Saved successfully');
	});
	p.catch((error) => {
	  console.log('Save failed');
	  console.log(error);
	});
	res.end('Word Added');
  });
  p.catch( (error) => {
    console.log(error);
    res.end('Get Category Fail');
  });
});

// deletes a category
app.get('/delete/:category', function (req, res) {
  let p = Category.findOneAndDelete({ title : req.params.category }).exec();
  p.then((response) => {
	console.log("Category Deleted");
  });
  p.catch( (error) => {
    console.log(error);
    res.end('Get Category Fail');
  });
});