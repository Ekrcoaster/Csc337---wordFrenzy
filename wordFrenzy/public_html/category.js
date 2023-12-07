/**
 * Authors: Ethan Rees, Joshua Boyer, Srinivas Pullela, Austin Hart
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
		headers: { 'Content-Type': 'application/json'},
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

let deleteCat = false;
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
	deleteCat = false;
}

// displays all the words for the categories on the webpage
function displayWords(but) {
	let category = but.name;
	fetch("/get/words/" + category).then((response) => {
		return response.text();
	}).then((res) => {
		let x =  document.getElementById("wordPosition");
		let html = '';
		html += res;
		html += '<div id="categoryButtons"><label>Input Word: </label><input id="word" type="text">';
		html += '<button id="addWordsCategory" onclick="addWords(this)" name="'+category+'">Add Word</button>';
		html += '<button id="deleteWordsCategory" onclick="deleteWords(this)" name="'+category+'">Delete Word</button>';
		html += '<button id="deleteCategoryButton" onclick="deleteCategory(this)" name="'+category+'">Delete This  Category</button></div>';
		html += '<p class="instructions">Add new words in the format of "newWord,2", in which you have the word you want followed by a comma followed by the point amount of that word (do not add the two quotes in the new word field), then hit the "Add Word" button.</p>'
		html += '<p class="instructions">Delete words by just typing the word you want to delete and hit the "Delete Word" button. Spaces do not matter when you add words or delete them, but just make sure to follow the format with a comma between the word and number.</p>'
		html += '<p class="instructions">If you want to delete a category, hit the "Delete This Category" button. It will give you a warning the first time. If you really want to delete it, hit the button again and it will disappear.</p>'
		x.innerHTML = html;
		deleteCat = false;
	}).catch((err) => {
		alert(err);
	});
}

// deletes a word from a category
function deleteWords(but) {
	let x = document.getElementById("word");
	if (x.value == "") {alert("No Word Input to Delete"); return;}
	let category = but.name;
	fetch("/delete/words/" + category + "/" + x.value).then((response) => {
		console.log('Word Deleted');
		displayWords(but);
	}).catch((err) => {
		alert(err);
	});
}

// adds a word from a category
function addWords(but) {
	let x = document.getElementById("word");
	if (x.value == "") {alert("No Word Input to Add"); return;}
	let category = but.name;
	fetch("/add/words/" + category + "/" + x.value).then((response) => {
		console.log('Word Added');
		displayWords(but);
	}).catch((err) => {
		alert(err);
	});
}

// deletes this category
function deleteCategory(but) {
	if (deleteCat) {
		let category = but.name;
		fetch("/delete/" + category).then((response) => {
			console.log("Category Deleted");
		}).catch((err) => {
			alert(err);
		});
		displayCategories();
		deleteCat = false;
	} else {
		deleteCat = true;
		alert("Click again if you actually want to delete category.");
	}
}

displayCategories();