/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the main serverside code for the game
 */

// the following are types used in vscode to help make writing js easier, they do not effect the code at all
/**@typedef {("waitingRoom"|"playing"|"done")} ActiveGameStates */
/**@typedef {("allowedWords"|"regex")} ActiveGameRuleSetMode */
/**@callback GameCompleteCallback @param {ActiveGame} game */

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
    gameStartedAt;

    /**@type {{name: String, submission: String}[]} */
    submissions = [];

    /**@type {GameCompleteCallback} */
    onGameComplete;

    /**@param {ActiveGameRuleSet[]} possibleRules @param {GameCompleteCallback} onGameComplete */
    constructor(possibleRules, onGameComplete) {
        this.id = "";
        for(let i = 0; i < 14; i++)
            this.id += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];

        this.players = {};
        this.state = "waitingRoom";
        // choose a random room from the list, if you would like to choose this rule, provide a list of 1
        this.ruleSet = possibleRules[Math.floor(Math.random() * possibleRules.length)];

        this.onGameComplete = onGameComplete;
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
            // game is over in 60 seconds
            this.gameOverAt = Date.now() + this.gameTime;
            this.gameStartedAt = Date.now();

            console.log(`-----\nStarting game with ${Object.keys(this.players).length} players!]`);
            console.log(` Category: ${this.ruleSet.name}`);
            console.log(` Started at: ${this.gameStartedAt}`);
            console.log(` Length: ${this.gameTime}`);
            console.log(` Ending At: ${this.gameOverAt}`);
            console.log("-----");

            // after gameTime is done, automatically stop
            setTimeout(() => {
                this.setState("done");
            }, this.gameTime);
        }

        if(state == "done") {
            this.onGameComplete(this);
        }
        return this;
    }

    /**
     * This will submit the player's submission, returning null if it worked, a string with the error message
     * if failed
     * @param {String} playerName 
     * @param {String} submission 
     */
    sendSubmission(playerName, submission) {
        if(this.isTimeUp()) this.setState("done");
        if(this.state != "playing") return "Game hasn't started / Game has ended";

        if(!this.ruleSet.doesMatch(submission))
            return "Invalid submission! Try again!";

        let player = this.getPlayer(playerName);
        if(player == null) return "Player is null! Can't find: " + playerName;

        // add the submissions
        player.submissions.push(submission);
        this.submissions.push({"name": playerName, "submission": submission});
        
        return null;
    }

    isTimeUp() {
        return Date.now() > this.gameOverAt;
    }

    getPlayerScores() {
        let players = [];
        for(let name in this.players) {
            players.push({score: this.getPlayer(name).calculateScore(), name: name, submissions: this.getPlayer(name).submissions.length});
        }
        players.sort((a, b) => b.score - a.score);
        return players;
    }

    getDryGameResults() {
        return {
            id: this.id,
            ruleSet: this.ruleSet,
            scores: this.getPlayerScores()
        }
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

    calculateScore() {
        return this.submissions.length * 10;
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
    return;
    // testing
    ACTIVE_GAME = new ActiveGame(POSSIBLE_GAME_SETS, (game) => {
        console.log(`-----\nGame Over! Here is the dry game:`);
        console.log(JSON.stringify(game.getDryGameResults()));
        console.log("-----");
    });
    ACTIVE_GAME.addPlayer(new ActivePlayer("bob"));
    ACTIVE_GAME.addPlayer(new ActivePlayer("alice"));

    ACTIVE_GAME.setState("playing");

    console.log(`Trying: "Alice"  --  ${ACTIVE_GAME.sendSubmission("bob", "Alice")}`);
    console.log(`Trying: "Bacon"  --  ${ACTIVE_GAME.sendSubmission("bob", "Bacon")}`);
    console.log(`Trying: "112312312"  --  ${ACTIVE_GAME.sendSubmission("alice", "112312312")}`);
    console.log(`Trying: "TestnigAAAAA"  --  ${ACTIVE_GAME.sendSubmission("alice", "TestnigAAAAA")}`);
    console.log(`Trying: "apple Yum"  --  ${ACTIVE_GAME.sendSubmission("bob", "Apple Yum")}`);
    console.log(`Trying: "rhyme"  --  ${ACTIVE_GAME.sendSubmission("alice", "Rhyme")}`);
}
//exports.Start();

exports.GetGame = () => {
    if(ACTIVE_GAME == null) return {error: "No game exists"};
    return {
        state: ACTIVE_GAME.state,
        gameOverAt: ACTIVE_GAME.gameOverAt,
        submissions: ACTIVE_GAME.submissions,
        scores: ACTIVE_GAME.getPlayerScores(),
        playerNames: Object.keys(ACTIVE_GAME.players),
        ruleSet: ACTIVE_GAME.ruleSet.name
    }
}

exports.Submit = (name, submission) => {
    if(ACTIVE_GAME == null) return {error: "No game exists"};
    let result = ACTIVE_GAME.sendSubmission(name, submission);
    if(result == null) return {ok: true, game: exports.GetGame()};
    return {error: result}
}

exports.AddPlayer = (name) => {
    if(ACTIVE_GAME == null) return {error: "No game exists"};
    if(name == null) return {error: "Username is null"}
    if(ACTIVE_GAME.getPlayer(name) != null) return {error: "This player already exists!"};
    ACTIVE_GAME.addPlayer(new ActivePlayer(name));
    return {ok: true};
}

exports.StartGame = () => {
    if(ACTIVE_GAME == null) return {error: "No game exists!"};
    if(ACTIVE_GAME.state != "waitingRoom") return {error: "Game is not in waiting room"};
    ACTIVE_GAME.setState("playing");
    return {ok: true}
}

exports.CreateGame = () => {
    if(ACTIVE_GAME != null) return {error: "Game already exists, you should delete it"};

    // create a new game with the possible game sets
    ACTIVE_GAME = new ActiveGame(POSSIBLE_GAME_SETS, (game) => {
        console.log(`-----\nGame Over! Here is the dry game:`);
        console.log(JSON.stringify(game.getDryGameResults()));
        console.log("-----");
    });

    return {ok: true}
}