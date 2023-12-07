/**
 * Authors: Ethan Rees, Joshua Boyer, Srinivas Pullela, Austin Hart
 * Course: Csc 337
 * Purpose: This is the code for the waiting room page
 */

var cacheLeaderboard = {};
// fetch the data from the server then store it in the cache
fetch("/leaderboard/get").then((data) => data.json())
.then((data) => {
    if(data.error)
        return alert("Error fetching leaderboard: " + data.error);

    cacheLeaderboard = data.leaderboard;
    setLeaderboard("scores");
}).catch((err) => {
    alert("Error fetching leaderboard: " + err);
})

/**
 * This function takes in a sub (scores or games) and will set the leaderboard
 * to that type, as well as the button selection
 */
function setLeaderboard(sub) {
    buildLeaderboard(sub, cacheLeaderboard[sub]);

    let toggles = document.getElementsByClassName("buttonToggle");
    for(let i = 0; i < toggles.length; i++) {
        toggles.item(i).classList = "buttonToggle";
    }

    document.getElementById(sub).classList += " active";
}

/**
 * This function will build the html and place it on the DOM.
 * It takes the sub (scores or games) and the leaderboard list
 */
function buildLeaderboard(sub, leaderboard) {
    let html = "";

    // build the html
    for(let i = 0; i < leaderboard.length; i++) {
        html += `<div class="player">
            <span class="sub">${i+1})</span> ${leaderboard[i].name}
                 <span class="sub">-</span> ${leaderboard[i].score}
            ${sub == "games" ? `<span class="sub"> games</span>` : `<span class="sub"> points</span>`}
        </div>`
    }

    document.getElementById("leaderboard").innerHTML = html;
}