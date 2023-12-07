/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the waiting room page
 */

// fetch the data from the server
fetch("/pastGames/get/" + getCookies().login.username).then((data) => data.json())
.then((data) => {
    if(data.error)
        return alert("Error fetching gamelist: " + data.error);

    buildGameList(data.games);
}).catch((err) => {
    alert("Error fetching gamelist: " + err);
})

/**
 * This function will build the html and place it on the DOM.
 * It takes the gamelist list
 */
function buildGameList(gamelist) {
    console.log(gamelist)
    let html = "";
    let myName = getCookies().login.username;

    // build the html
    for(let i = 0; i < gamelist.length; i++) {
        let game = gamelist[i];
        let didWin = game.scores[0].name == myName;
        let myScore = game.scores.find((x) => x.name == myName);

        html += `<div class="pastGame${didWin ? 'Win' : 'Loss'}">
            ${game.ruleSet} | Score: ${myScore.score} | ${new Date(game.timePlayedAt).toDateString()}
        </div>`
    }

    document.getElementById("gameHistory").innerHTML = html;
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