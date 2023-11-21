/**
 * Authors:
 * Course: Csc 337
 * Purpose: This is the code for the category editing page
 */
 
 // send the new category data to the server to create a new category
 document.getElementById("sendCategoryButton").addEventListener("click", () => {
    // check requirements
    if(document.getElementById("categoryTitle").value == "") {alert("Category needs a title!"); return;}
    if(document.getElementById("categoryDescription").value == "") {alert("Category needs a description!"); return;}
    if(document.getElementById("newWords").value == "") {alert("Category needs new words!"); return;}

    // send the data
	let ct = document.getElementById("categoryTitle");
	let cd = document.getElementById("categoryDescription");
	let nw = document.getElementById("newWords");
	let post = {cTitle: ct.value, cDescription: cd.value, cWords: nw.value};

    fetch("/create/category", {
        method: "POST",
        body: JSON.stringify(post),
		headers: { 'Content-Type': 'application/json'}
    }).then((res) => {
        if (res.error) {
            alert("Error: " + res.error);
		} else {
			console.log("Category Created");
		}
    }).catch((err) => {
        alert(err);
    });
	
	ct.value = "";
	cd.value = "";
	nw.value = "";

	displayCategories();
});

// displays all the categories on the webpage
function displayCategories() {
	fetch("/get/categories").then((response) => {
		return response.text();
	}).then((res) => {
		let x =  document.getElementById("categoryPosition");
		x.innerHTML = res;
	}).catch((err) => {
		alert(err);
	});
}

// displays all the words for the categories on the webpage
function displayWords(but) {
	let category = but.name;
	fetch("/get/words/" + category).then((response) => {
		return response.text();
	}).then((res) => {
		let x =  document.getElementById("wordPosition");
		x.innerHTML = res;
	}).catch((err) => {
		alert(err);
	});
}

displayCategories();