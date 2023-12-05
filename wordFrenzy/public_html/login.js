/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the login page
 */
//const DATABASE = require("./database");
//exports.DATABASE = DATABASE;

function login() {
    let us = document.getElementById('usernameLogin').value;
    let pw = document.getElementById('passwordLogin').value;
    let data = { username: us, password: pw };
    let p = fetch('/account/login/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    p.then((response) => {
        return response.text();

    }).then((text) => {
        if (text.startsWith('SUCCESS')) {
            window.location.href = '/app/waitingRoom.html';
        } else {
            alert('failed');
        }
    });
}

function createAccount() {
    let us = document.getElementById('usernameCreate').value;
    let pw = document.getElementById('passwordCreate').value;
    let p = fetch('/account/create/' + us + '/' + encodeURIComponent(pw));
    p.then((response) => {
        return response.text();
    }).then((text) => {
        alert(text);
    });
}