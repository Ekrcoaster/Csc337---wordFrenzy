/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the game page
 */

var onGameUpdate = (game => {
    if(game.error) {
        if(game.error == "No game exists") {
            alert("No game exists! Please create one first!");
            location.href = "/index.html";
        }
        console.error(game.error);
        return;
    }

    if(game.state == "done") {
        location.href = "/app/results.html";
        return;
    }

    document.getElementById("category").innerText = game.ruleSet;
    let time = calculateTimeDifference(game.gameOverAt);
    document.getElementById("timer").innerText = `Time: ${time.mins}:${time.secs}`

    document.getElementById("submissionDisplay").innerHTML = buildSubmissions(game.submissions);

    for(let i = 0; i < game.scores.length; i++) {
        console.log(game.scores[i])
        if(game.scores[i].name == "bob") {
            document.getElementById("playerName").innerText = game.scores[i].name;
            document.getElementById("playerScore").innerText = game.scores[i].score;
            document.getElementById("playerGuesses").innerText = game.scores[i].submissions;
        }
    }

    console.log(game)
});

// update the game on load, 
updateGame(onGameUpdate);
setInterval(() => {
    updateGame(onGameUpdate);
}, 900);

function updateGame(callback) {
    fetch("/activeGame/getGame").then((res => res.json()))
    .then((game) => callback(game))
    .catch((err) => console.error(err));
}

function sendSubmission() {
    let input = document.getElementById("playerGuess");
    fetch("/activeGame/submit", {
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
            "username": "bob",
            "submission": input.value
        })
    }).then((res) => res.json()).then(
        (res) => {
            if(res.error) alert(res.error);
            else {
                input.value = "";
                onGameUpdate(res.game);
            }
        }).catch((err) => {
            alert(err);
        });
}

function calculateTimeDifference(time) {
    let dif = new Date(Math.abs(time - Date.now()));

    let mins = dif.getMinutes().toString();
    if(mins.length == 1) mins = "0" + mins;

    let secs = dif.getSeconds().toString();
    if(secs.length == 1) secs = "0" + secs;

    return {mins, secs}
}

function buildSubmissions(submissions) {
    let html = "";

    for(let i = 0; i < submissions.length; i++) {
        html += `<div class="submissionItem">
        
        <p>${submissions[i].name}:</p>
        <p>${submissions[i].submission}</p>
        
        </div>`
    }
    
    return html;
}