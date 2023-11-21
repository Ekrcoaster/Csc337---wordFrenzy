# Welcome to Word Frenzy
To avoid conflicts, we should each work in our own branch, then merge once the feature we are working on is done

## Server:
`server.js`
> This is the express server that handles requests. Try to avoid writing code here, instead put it in **game.js** or **database.js**

`game.js`
> this is the code that handles active games. To export a value to be used in server.js, use exports.YOUR_VAR_NAME = ...

> Then, in the server.js, use GAME.YOUR_VAR_NAME...

`database.js`
> Any interaction with the database should be put here! To export a variable or method, use exports.YOUR_VAR_NAME = ...

> Then, in the server.js, use DATABASE.YOUR_VAR_NAME...

## API Usage:
### Active Game

`/activeGame/createGame` (post)
> This will create a game, eventually params will be able to be passed, but for now theres no params yet.

`/activeGame/addPlayer` (post)
> This will add a player to the game
> Send body as JSON, in the body include "username"

`/activeGame/start` (post)
> This will start the game

`/activeGame/getGame` (get)
> Fetch the active game (if it exists)
> If no error, will return state, gameOverAt (unix timestamp), submissions (an array), scores, playerNames

`/activeGame/submit` (post)
> Send a submission for the game
> Send body as JSON, in the body you need to include "username" and "submission" (which is the text submission)

### Past Games

`/pastGames/get/:USERNAME` (get)
> This will fetch all of the past games for a given user

## Active Game
The game has a few different states:

**waitingRoom**
> This is pre-game. Players should be able to join here.

**playing**
> This is the game itself, this is where everyone is sending submissions and score is kept. Players cannot be added during this stage, if someone joins the website, they should be spectators. Also, the game chooses an end time based on when this state is changed, so maybe the UI could have a countdown.

**done**
> This means the game is done, submissions and new players are rejected. By this point, it should be converted to a **Past Game**

> __An Active Game is automatically converted to a past game once the time has run out!__ The active game won't be cleared until a new game has been created, or the server has restarted. (We could change this since theres really no good reason to do this, but no bad reason to not)

## Past Game
> A past game is a game that is stored in the MongoDB database. It contains the names of who played and their scores, the date the game played, and then the topic. Everything else is stripped. 
=======