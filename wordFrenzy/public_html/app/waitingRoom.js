/**
 * Authors: Ethan Rees
 * Course: Csc 337
 * Purpose: This is the code for the waiting room page
 */

/**
 * This function is called once an update is recieved from the server.
 * The game parameter contains a bunch of params from the server, such as custom errors,
 * state, players, etc
 * 
 * This is where html should be updated
 */
var onGameUpdate = (game) => {
    // check for custom error
    if (game != null && game?.error) {
        error(game?.error);
        if (game.error == "No game exists") {
            createGame();
            return;
        }
        console.error(game.error);
        return;
    }

    // if the game started, redirect
    if (game.state == "playing") {
        location.href = "/app/game.html";
        return;
    }

    document.getElementById("connectedPlayers").innerHTML = buildConnectedPlayers(game.playerNames)
    console.log(game)
};

// update the game on load, 
updateGame(onGameUpdate);
setInterval(() => {
    updateGame(onGameUpdate);
}, 900);

document.getElementById("startGame").addEventListener("click", startGame);

// once the page loads, get the name from the cookies and login to the game

async function fetchName(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.username;
    } catch (error) {
        console.error('There was a problem fetching the name:', error);
        return null;
    }
}


async function init() {
    try {
        let name = await fetchName('/account/getName');
        fetch("/activeGame/addPlayer", {
            "method": "POST",
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "username": name
            })
        }).then((res) => res.json()) // Now this runs after the name is fetched
    } catch (error) {
        console.error('Error in init:', error);
    }
}

init();

/**
 * This function will ask the server for an update to the game, and provides
 * a callback function with the data returned from the server.
 */
function updateGame(callback) {
    fetch("/activeGame/getGame").then((res => res.json()))
        .then((game) => callback(game))
        .catch((err) => console.error(err));
}

/**
 * If someone joins the lobby but a game doesn't exist yet, create it!
 * It is done this way so the login page (or whatever comes before this) doesn't have to handle creating
 * and managing games
 */
function createGame() {
    console.log("Game doesn't exist... creating!");

    fetch("/activeGame/createGame", {
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
        })
    }).then((res) => res.json())
        .then((res) => {
            onGameUpdate(res.game);
        }).catch((err) => {
            console.error(err);
        });
}

/**
 * This function will be called once the start button is pressed. It sends a
 * request to the server and will return the answer or an error
 */
function startGame() {
    fetch("/activeGame/start", {
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
        })
    }).then((res) => res.json())
        .then((res) => {
            if (res.error) error(res.error);
            else onGameUpdate(res.game);
        }).catch((err) => {
            error(err);
        });
}

/**
 * This function will return the HTML to build the player list. 
 * It is given an array of players
 */
function buildConnectedPlayers(players) {
    let html = "";
    for (let i = 0; i < players.length; i++) {
        html += `<div class="playerItem">

            ${players[i]}

        </div>`
    }
    return html;
}

/**
 * This function will push the error message to the page. The "err" param is the
 * error message
 */
function error(err) {
    document.getElementById("errorStartGame").style.display = "block";
    document.getElementById("errorStartGame").innerText = "Error: " + err;
}