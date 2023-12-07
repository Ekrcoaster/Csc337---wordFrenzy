/**
 * Authors: Ethan Rees, Joshua Boyer, Srinivas Pullela, Austin Hart
 * Course: Csc 337
 * Purpose: This is the code for the achievement page
 */
	
/**
 * This function gets the achievements and loads them
 */
function getAchievements() {
  fetch('/account/achievement').then((response) => {
    return response.text();
  }).then((text) => {
	if (text != "") {
		if (text.indexOf('!') > -1) {
			let achieve = text.split("!");
			for (let i = 0; i < achieve.length; i++) {
				document.getElementById(achieve[i]).className = 'yes';
			}
		} else {
			document.getElementById(achieve).className = 'yes';
		}
	}
  }).catch( (error) => {
    console.log(error);
  }); 
}

window.onload = getAchievements;
