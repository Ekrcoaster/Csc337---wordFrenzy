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
    scores: [{name: String, score: Number}],
    ruleSet: String
});
const PastGame = mongoose.model("PastGame", pastGameSceme);

/**@param {ActiveGame} activeGame */
exports.ConvertActiveGame = function(activeGame) {
    return new Promise((resolve, reject) => {
        if(activeGame == null) {
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

exports.GetPastGames = function(username) {
    return new Promise((resolve, reject) => {
        PastGame.find({"scores.name": username}).then((games) => {
            resolve(games);
        }).catch((err) => {
            reject(err);
        })
    });
}