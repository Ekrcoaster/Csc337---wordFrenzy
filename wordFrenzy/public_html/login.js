/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the login page
 */
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const createAccountForm = document.getElementById('createAccountForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            login();
        });
    }

    if (createAccountForm) {
        createAccountForm.addEventListener('submit', function (e) {
            e.preventDefault();
            createAccount();
        });
    }
});

function login() {
    let us = document.getElementById('usernameLogin').value;
    let pw = document.getElementById('passwordLogin').value;
    let data = { username: us, password: pw };
    let p = fetch('/activeGame/login/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
    });
    p.then((response) => {
        return response.text();
    }).then((text) => {
        console.log(text);
        if (text.startsWith('SUCCESS')) {
            sessionStorage.setItem('username', data.username);
            window.location.href = 'app/game.html';
        } else {
            alert('failed');
        }
    });
}

function createAccount() {
    let us = document.getElementById('usernameCreate').value;
    let pw = document.getElementById('passwordCreate').value;
	console.log('/activeGame/addPlayer' + us + '/' + encodeURIComponent(pw));
    let p = fetch('/activeGame/addPlayer' + us + '/' + encodeURIComponent(pw));
    p.then((response) => {
        return response.text();
    }).then((text) => {
        alert(text);
    });
}