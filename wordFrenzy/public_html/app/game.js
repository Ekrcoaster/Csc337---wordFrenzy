/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the game page
 */

let myName;
let myNameIndex;
let opponentIndex;

let lastSubmissionLength = -1;

setBorderWrongColor(true);

/**
 * This callback will be called whenever the game receives an update from the server
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
        document.getElementById("ending").style.display = "block";
        document.getElementById("endingText").innerText = `${game.scores[0].name} has won!`;
        return;
    }

    myName = getCookies().login.username;

    document.getElementById("category").innerText = '"' + game.ruleSet + '"';
    let time = calculateTimeDifference(game.gameOverAt);
    document.getElementById("timer").innerText = `Time: ${time.mins}:${time.secs}`

    updatePlayerStats(game);

    let display = document.getElementById("submissionDisplay");
    display.innerHTML = buildSubmissions(game.submissions);

    // if the submissions changes (a new one gets added), scroll to the bottom of the list
    if(game.submissions.length != lastSubmissionLength) {
        lastSubmissionLength = game.submissions.length;
        display.scrollTop = display.scrollHeight;
    }

    console.log(game)
});

/**
 * When passed the game update object from the server, it'll update the player stats
 */
function updatePlayerStats(game) {
    for(let i = 0; i < game.scores.length; i++) {
        if(game.scores[i].name == myName) {
            document.getElementById("playerName").innerText = game.scores[i].name;
            document.getElementById("playerScore").innerText = game.scores[i].score;
            document.getElementById("playerGuesses").innerText = game.scores[i].submissions;
            document.getElementById("playerSide").style.background = `linear-gradient(0deg, transparent 0%, ${getBackgroundColor(i)} 100%)`;
            myNameIndex = i;
        } else {
            document.getElementById("opponentName").innerText = game.scores[i].name;
            document.getElementById("opponentScore").innerText = game.scores[i].score;
            document.getElementById("opponentGuesses").innerText = game.scores[i].submissions;
            document.getElementById("opponentSide").style.background = `linear-gradient(0deg, transparent 0%, ${getBackgroundColor(i)} 100%)`;
            opponentIndex = i;
        }
    }
}

/**
 * This will return the background color for submissions.
 * Index == 0 will be blue, 1 will be red;
 */
function getBackgroundColor(index) {
    if(index == 0) return "rgba(55, 55, 217, 0.25)";
    return "rgba(217, 55, 55, 0.25)";
}

/**
 * This will return the border color for submissions.
 * Index == 0 will be blue, 1 will be red;
 */
function getBorderColor(index) {
    if(index == 0) return "rgba(48, 48, 195, 1)";
    return "rgba(217, 55, 55, 1)";
}

// update the game on load, 
updateGame(onGameUpdate);
setInterval(() => {
    updateGame(onGameUpdate);
}, 500);

/**
 * This will just update the game from the server
 */
function updateGame(callback) {
    fetch("/activeGame/getGame").then((res => res.json()))
    .then((game) => callback(game))
    .catch((err) => console.error(err));
}

/**
 * This function will send the submission currently in the submission box.
 * If the player got it right, it'll refresh the gameupdate function
 * If not, it'll shake the screen red
 */
function sendSubmission() {
    myName = getCookies().login.username;

    let input = document.getElementById("playerGuess");
    fetch("/activeGame/submit", {
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
            "username": myName,
            "submission": input.value
        })
    }).then((res) => res.json()).then(
        (res) => {
            if(res.error) {
                shakeRed();
            }
            else {
                input.value = "";
                onGameUpdate(res.game);
            }
        }).catch((err) => {
            alert(err);
        });
}

/**
 * This function takes a time (unix) and will return
 * an object with the string minutes/seconds 
 * (including the leading 0 if needed)
 */
function calculateTimeDifference(time) {
    let dif = new Date(Math.abs(time - Date.now()));

    let mins = dif.getMinutes().toString();
    if(mins.length == 1) mins = "0" + mins;

    let secs = dif.getSeconds().toString();
    if(secs.length == 1) secs = "0" + secs;

    return {mins, secs}
}

/**
 * This function will return html for the submission list. Pass in
 * an object list of submissions
 */
function buildSubmissions(submissions) {
    let html = "";

    // for each submission, build the html as a string
    for(let i = 0; i < submissions.length; i++) {
        
        // find some setups
        let name = submissions[i].name;
        let isMySubmission = myName == name;
        let useIndex = isMySubmission ? myNameIndex : opponentIndex;

        // generate random shifts
        let randomX = consistentRandom(i*243+i, 20)-10;
        let randomRotation = consistentRandom(i*555-i*3, 5)-2.5;

        // then, everytime this gets updated, include a chance of randomly updating the rotation
        // this helps give the guesses some life
        if(Math.random() > 0.5)
            randomRotation += Math.random() - 0.5;


        html += 
        `<div class="submissionItem shadow" style="
            translate: ${randomX}px 0px; 
            rotate: ${randomRotation}deg; 
            margin-${isMySubmission ? "left" : "right"}: 25px;
            background-color: ${getBackgroundColor(useIndex)};
            border-color: ${getBorderColor(useIndex)}
            ">
            
            <p class="submissionItemWord">${submissions[i].submission}</p>
            <p class="submissionItemName">${name} Guessed</p>
            
        </div>`
    }
    
    return html;
}

/**
 * This function will generate a random number between 0-max w/ the seed
 * This is different from Math.Random because the same seed will return the
 * same output. Awesome for consistency between rerenders.
 */
function consistentRandom(seed, max) {
    return Math.abs(23257 * seed + 232164) % max;
}

/**
 * This function will get the cookies for the page, it has to convert them
 * and then parse them.
 * It returns the cookies object
 */
function getCookies() {
    let raw = Object.fromEntries(new URLSearchParams(document.cookie.replace(/; /g, "&")));

    let cookies = {}
    for(let id in raw) {
        if(raw[id].startsWith("j:"))
            cookies[id] = JSON.parse(raw[id].substring(2));
        else
            cookies[id] = raw[id];
    }
    return cookies;
}

/**
 * This function will set the green borders to the correct color
 * isGreen will make them green if true, red if not
 */
function setBorderWrongColor(isGreen) {
    // change the border colors
    let elements = document.getElementsByClassName("border");
    for(let i = 0; i < elements.length; i++) {
        let el = elements.item(i);
        el.style.borderColor = isGreen ? "rgb(94, 163, 56)" : "rgb(163, 56, 56)";
    }

    // change the submission text to red if red
    document.getElementById("playerGuess").style.color = isGreen ? "white" : "red";

    // change the text colors of these borders
    elements = document.getElementsByClassName("borderText");
    for(let i = 0; i < elements.length; i++) {
        let el = elements.item(i);
        el.style.color = isGreen ? "rgb(94, 163, 56)" : "rgb(163, 56, 56)";
    }
}

/**
 * This function will shake the screen and change the green to red
 */
function shakeRed() {
    setBorderWrongColor(false);

    let s = 1;
    // run for 1 second, shaking randomly then fading out
    let interval = setInterval(() => {
        if(s <= 0) {
            clearInterval(interval);
            setBorderWrongColor(true);
            return;
        }

        // shake the body by a random amount, but get less
        let shake = Math.random() * 20 - 10;
        shake *= s;
        document.body.style.translate = shake + "px 0px";
        
        s -= 0.01;
    }, 10);
}