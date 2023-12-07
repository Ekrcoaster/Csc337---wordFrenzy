/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the main database for the game.
 * It is split into its own file for simplicity and readability
 */

// --------------
// THE DATABASE
// --------------

const md5 = require("md5");
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
		words.push(newWord[0].toLowerCase().trim());
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
	  
	  let index = words.indexOf(word.toLowerCase().trim());
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

var achievementArray = [{ name: "firstGame", achieved: 0 }, { name: "fifthGame", achieved: 0 }, 
	{ name: "teenGame", achieved: 0 }, { name: "hunGame", achieved: 0 }, { name: "firstGuess", achieved: 0 },
	{ name: "hunGuess", achieved: 0 }, { name: "oneWin", achieved: 0 }];
	
exports.UpdateAchievement = function (a) {

}

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
	achievements: [{ name: String, achieved: Number }],
	guesses: Number,
	wins: Number,
	games: Number
});
var User = mongoose.model('User', UserSchema);

exports.CreateUser = function (username, password) {
    let newUser = new User();
    newUser.username = username;
    newUser.password = md5(password);
	newUser.achievements = achievementArray;
	newUser.guesses = 0;
	newUser.wins = 0;
	newUser.games = 0;

    return newUser.save();
}

exports.FindUser = function (user, pass) {
    return User.find({ username: user, password: md5(pass) })
}

exports.FindUserJustUsername = function (user) {
    return User.find({ username: user })
}

exports.GetLeaderboard = () => {
    return new Promise((resolve, reject) => {
        PastGame.find({ }).then((games) => {
            let data = {
                "games": [],
                "scores": []
            }

            // step 1, count all of the different fields
            let gameCount = {};
            let scoreCount = {};
            for(let i = 0; i < games.length; i++) {
                for(let j = 0; j < games[i].scores.length; j++) {
                    let name = games[i].scores[j].name;
                    let score = games[i].scores[j].score;

                    gameCount[name] = (gameCount[name] || 0) + (i == 0 ? 1 : 0);
                    scoreCount[name] = (scoreCount[name] || 0) + score;
                }
            }

            // step 2, put them all in an array
            for(let name in gameCount)
                data.games.push({name: name, score: gameCount[name]});
            for(let name in scoreCount)
                data.scores.push({name: name, score: scoreCount[name]});

            // now, sort the data (largest first)
            data.games.sort((a, b) => b.score - a.score);
            data.scores.sort((a, b) => b.score - a.score);

            resolve(data);

        }).catch((err) => {
            reject(err);
        })
    });
}