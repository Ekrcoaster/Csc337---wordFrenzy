/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the main serverside code for the game
 */

// the following are types used in vscode to help make writing js easier, they do not effect the code at all
/**@typedef {("waitingRoom"|"playing"|"done")} ActiveGameStates */
/**@typedef {("allowedWords"|"regex")} ActiveGameRuleSetMode */

/*
    This class controls an active game, its state, players, and score
*/
class ActiveGame {
    id = "";
    players = {};
    /**@type {ActiveGameStates} */
    state;
    /**@type {ActiveGameRuleSet} */
    ruleSet;
    
    // the game lasts 60 seconds
    gameTime = 60*1000;
    gameOverAt;

    /**@type {{name: String, submission: String}[]} */
    submissions = [];

    /**@param {ActiveGameRuleSet[]} possibleRules */
    constructor(possibleRules) {
        this.id = "";
        for(let i = 0; i < 14; i++)
            this.id += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];

        this.players = {};
        this.state = "waitingRoom";
        // choose a random room from the list, if you would like to choose this rule, provide a list of 1
        this.ruleSet = possibleRules[Math.floor(Math.random() * possibleRules.length)];

        // game is over in 60 seconds
        this.gameOverAt = Date.now() + this.gameTime;
    }

    addPlayer(player) {
        this.players[player.name] = player;
        return this;
    }

    /**@returns {ActivePlayer} */
    getPlayer(name) {
        return this.players[name];
    }

    /**@param {ActiveGameStates} state */
    setState(state) {
        // prevent double calls
        if(state == this.state) return;

        this.state = state;
        if(state == "playing") {
            console.log(`-----\nStarting game with ${Object.keys(this.players).length} players!]\nCategory: ${this.ruleSet.name}\n-----`);

            // after gameTime is done, automatically stop
            setTimeout(() => {
                this.setState("done");
            }, this.gameTime);
        }

        if(state == "done") {
            console.log(`-----\nGame Over!\nCategory: ${this.ruleSet.name}\nSubmissions:`, this.submissions, `-----`);
        }
        return this;
    }

    /**
     * This will submit the player's submission, returning true or false if it was correct
     * @param {String} playerName 
     * @param {String} submission 
     */
    sendSubmission(playerName, submission) {
        if(this.isTimeUp()) this.setState("done");
        if(this.state != "playing") return false;

        if(!this.ruleSet.doesMatch(submission))
            return false;

        let player = this.getPlayer(playerName);
        if(player == null) throw "Player is null! Can't find: " + playerName;

        // add the submissions
        player.submissions.push(submission);
        this.submissions.push({"name": playerName, "submission": submission});
        
        return true;
    }

    isTimeUp() {
        return Date.now() > this.gameOverAt;
    }
}

/**
 * This class represents an active player, it contains their submissions, etc
 */
class ActivePlayer {
    name = "";
    submissions = [];

    constructor(name) {
        this.name = name;
    }
}

/**
 * This class represents the ruleset of a game, it is used to play the game
 */
class ActiveGameRuleSet {
    name;
    /**@type {ActiveGameRuleSetMode} */
    mode;

    regex;
    allowedWords = [];

    constructor(name) {
        this.name = name;
        this.mode = "allowedWords";

        this.regex = null;
        this.allowedWords = [];
    }

    /**
     * This will set the active ruleset to listen to regex
     */
    setRegex(regex) {
        this.mode = "regex";
        this.regex = new RegExp(regex, "gi");
        return this;
    }

    /**
     * This will set the active set to allowed words
     */
    setAllowedWords(words = []) {
        this.mode = "allowedWords";
        // convert to lowercase so we can ignore case
        this.allowedWords = words.map((x) => x.toLowerCase());
        return this;
    }

    doesMatch(submission = "") {
        submission = submission.toLowerCase().trim();

        if(this.mode == "regex")
            return submission.match(this.regex) != null;

        if(this.mode == "allowedWords")
            return this.allowedWords.indexOf(submission) > -1;

        console.error(`The mode ${this.mode} hasn't been implemented yet!`);
        return false;
    }
}

/**@type {ActiveGame} */
var ACTIVE_GAME = null;
var POSSIBLE_GAME_SETS = [
    new ActiveGameRuleSet("Words that start with A").setRegex("^a"),
    new ActiveGameRuleSet("Words that rhyme with \"time\"").setAllowedWords(["crime", "rhyme"])
]

exports.Start = () => {
    // testing
    ACTIVE_GAME = new ActiveGame(POSSIBLE_GAME_SETS);
    ACTIVE_GAME.addPlayer(new ActivePlayer("bob"));

    ACTIVE_GAME.setState("playing");

    console.log(`Trying: "Alice"  --  ${ACTIVE_GAME.sendSubmission("bob", "Alice")}`);
    console.log(`Trying: "Bacon"  --  ${ACTIVE_GAME.sendSubmission("bob", "Bacon")}`);
    console.log(`Trying: "112312312"  --  ${ACTIVE_GAME.sendSubmission("bob", "112312312")}`);
    console.log(`Trying: "TestnigAAAAA"  --  ${ACTIVE_GAME.sendSubmission("bob", "TestnigAAAAA")}`);
    console.log(`Trying: "apple Yum"  --  ${ACTIVE_GAME.sendSubmission("bob", "Apple Yum")}`);
    console.log(`Trying: "rhyme"  --  ${ACTIVE_GAME.sendSubmission("bob", "Rhyme")}`);
}
exports.Start();