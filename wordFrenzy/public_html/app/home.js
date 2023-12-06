/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the game page
 */

function logOut() {
    fetch("/account/logout", {
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
        })
    }).then((res) => res.json())
        .then((res) => {
            if(res.error) {
                alert("Error logging out: " + res.error);
                return;
            }
            location.href = "/index.html";
        }).catch((err) => {
            alert("Error logging out: " + err);
        });
}