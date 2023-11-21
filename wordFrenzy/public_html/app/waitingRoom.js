/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the waiting room page
 */

var onGameUpdate = (game) => {
    if(game.error) {
        if(game.error == "No game exists") {
            createGame();
            return;
        }
        console.error(game.error);
        return;
    }

    if(game.state == "playing") {
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

playerJoin();
function playerJoin() {
    let name = prompt("what is your name? (thisll be replaced later with cookies)");
    fetch("/activeGame/addPlayer", {
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
            "username": name
        })
    }).then((res) => res.json())
}

function updateGame(callback) {
    fetch("/activeGame/getGame").then((res => res.json()))
    .then((game) => callback(game))
    .catch((err) => console.error(err));
}

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
        onGameUpdate(res.game);
    }).catch((err) => {
        console.error(err);
    });
}

function buildConnectedPlayers(players) {
    let html = "";
    for(let i = 0; i < players.length; i++) {
        html += `<div class="playerItem">

            <p>${players[i]}</p>

        </div>`
    }
    return html;
}