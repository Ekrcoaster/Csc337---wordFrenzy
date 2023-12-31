/**
 * Authors: Ethan Rees, Joshua Boyer, Srinivas Pullela, Austin Hart
 * Course: Csc 337
 * Purpose: This is the code for the login page
 */
//const DATABASE = require("./database");
//exports.DATABASE = DATABASE;

/**
 * This function will login the account
 */
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
            window.location.href = '/app/home.html';
        } else {
            alert('failed - ' + text);
        }
    });
}

/**
 * This function will create the account
 */
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