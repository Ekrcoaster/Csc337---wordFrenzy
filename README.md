# Welcome to Word Frenzy
To avoid conflicts, we should each work in our own branch, then merge once the feature we are working on is done

## API Usage:

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

## Active Game
The game has a few different states:

**waitingRoom**
> This is pre-game. Players should be able to join here.

**playing**
> This is the game itself, this is where everyone is sending submissions and score is kept. Players cannot be added during this stage, if someone joins the website, they should be spectators. Also, the game chooses an end time based on when this state is changed, so maybe the UI could have a countdown.

**done**
> This means the game is done, submissions and new players are rejected. By this point, it should be converted to a **dryGame**

## Dry Game

Thats just the name I came up with for a game that has already been played and should be stored in the history. This is the type that is stored in the mongodb database. We can change this if it is too confusing.
=======