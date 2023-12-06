/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the main database for the game.
 * It is split into its own file for simplicity and readability
 */

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

const pastGameSceme = new mongoose.Schema({
    timePlayedAt: Number,
    scores: [{ name: String, score: Number }],
    ruleSet: String
});
const PastGame = mongoose.model("PastGame", pastGameSceme);

/**@param {ActiveGame} activeGame */
exports.ConvertActiveGame = function (activeGame) {
    return new Promise((resolve, reject) => {
        if (activeGame == null) {
            reject("Active Game is Null!");
            return;
        }

        // get the past game object then plug it into the database
        let game = new PastGame(activeGame.getAsPastGame());

        game.save().then((game) => {
            resolve(game);
        }).catch((err) => {
            reject(err);
        });
    });
}

exports.GetPastGames = function (username) {
    return new Promise((resolve, reject) => {
        PastGame.find({ "scores.name": username }).then((games) => {
            resolve(games);
        }).catch((err) => {
            reject(err);
        })
    });
}

// define the game category data structure for a round of gameplay
const categorySceme = new mongoose.Schema({
    title: String,
    description: String,
    words: [String],
    points: [Number]
});
const Category = mongoose.model("Category", categorySceme);

exports.GetCustomCategories = function (searchParams = {}) {
    return Category.find(searchParams);
}

exports.AddWordCategory = function (title, word) {
	let p = Category.find(title).exec();
    return p.then((response) => {
	  let newWord = word.split(",");
	  let words = response[0].words;
	  let points = response[0].points;

	  let index = words.indexOf(newWord[0]);
	  if (index < 0) {
		words.push(newWord[0].trim());
	    points.push(newWord[1].trim());
	  }  
		
	  response[0].words = words;
	  response[0].points = points;
	  
	  return response[0].save();
	});
    p.catch( (error) => {
      console.log(error);
      res.end('Get Category Fail');
    });
}

exports.DeleteWordCategory = function (title, word) {
	let p = Category.find(title).exec();
    return p.then((response) => {
	  let words = response[0].words;
	  let points = response[0].points;
	  
	  let index = words.indexOf(word.trim());
	  if (index > -1) {
		words.splice(index, 1);
		points.splice(index,1);
	  }  
	  
	  response[0].words = words;
	  response[0].points = points;
	  return response[0].save();
	});
    p.catch( (error) => {
      console.log(error);
      res.end('Get Category Fail');
    });
}

exports.CreateCategory = function (title, description, words, points) {
    let newCategory = new Category;

    newCategory.title = title;
    newCategory.description = description;

    newCategory.words = words;
    newCategory.points = points;

    // saves this new category to the databse
    return newCategory.save();
}

exports.FindAndDeleteCategory = function (title) {
    return Category.findOneAndDelete(title);
}

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
var User = mongoose.model('User', UserSchema);

exports.CreateUser = function (username, password) {
    let newUser = new User();
    newUser.username = username;
    newUser.password = password;

    return newUser.save();
}

exports.FindUser = function (user, pass) {
    return User.find({ username: user, password: pass })
}

exports.FindUserJustUsername = function (user) {
    return User.find({ username: user })
}