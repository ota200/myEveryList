const myForm = document.getElementById("myForm");

/*
myForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log(e.target.value);
    const name = $('#mediaName').val();
    const desc = $('#mediaDescription').val();
    const type = $('#mediaType').val();
    const status = $('#mediaStatus').val();

    // Keep each item in its own container so deleting it does not remove the list.
    $('#media-list').append(`
        <div class="media-item">
            <h1>${name}</h1>
            <p>${desc}</p>
            <p>${type}</p>
            <p>${status}</p>
            <button type="button" value="delete" class="delete-btn" onclick="ondelete(event)">Delete</button>
        </div>
    `);

    myForm.reset();
});
*/

let mediaList = [];
let categories = [];

myForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById("mediaName").value;
    const desc = document.getElementById("mediaDescription").value;
    const type = document.getElementById("mediaType").value;
    const status = document.getElementById("mediaStatus").value;

    mediaList.unshift({
        name: name,
        desc: desc,
        type: type,
        status: status
    });
    
    categories.push(type);
    localStorage.setItem('mediaList', JSON.stringify(mediaList));
    localStorage.setItem('categories', JSON.stringify(categories));

    renderMediaList();

    myForm.reset();
});

function ondelete(e){
    e.preventDefault();
    const index = e.target.dataset.index;
    mediaList.splice(index, 1);
    localStorage.setItem('mediaList', JSON.stringify(mediaList));
    renderMediaList();
}

//on Edit button

function onEdit(e) {
    e.preventDefault();

    const index = e.target.dataset.index;

    const name = document.getElementById("media-name-" + index).textContent;
    const desc = document.getElementById("media-description-" + index).textContent;
    const type = document.getElementById("media-type-" + index).textContent;
    const status = document.getElementById("media-status-" + index).textContent;

    const mediaItem = document.getElementById("media-item-" + index);

    mediaItem.innerHTML = `
        <form onsubmit="onSave(event)" data-index="${index}">
            <h1>Edit Media</h1>

            <input
                id="mediaName-${index}"
                type="text"
                value="${name}"
                placeholder="Media name"
                required
            >

            <select id="mediaType-${index}" required>
                <option value="books" ${type === "books" ? "selected" : ""}>Books</option>
                <option value="movies" ${type === "movies" ? "selected" : ""}>Movies</option>
                <option value="manga" ${type === "manga" ? "selected" : ""}>Manga</option>
                <option value="anime" ${type === "anime" ? "selected" : ""}>Anime</option>
                <option value="games" ${type === "games" ? "selected" : ""}>Games</option>
            </select>

            <select id="mediaStatus-${index}" required>
                <option value="want-to-watch" ${status === "want-to-watch" ? "selected" : ""}>Want to Watch</option>
                <option value="watching" ${status === "watching" ? "selected" : ""}>Watching</option>
                <option value="completed" ${status === "completed" ? "selected" : ""}>Completed</option>
                <option value="dropped" ${status === "dropped" ? "selected" : ""}>Dropped</option>
                <option value="playing" ${status === "playing" ? "selected" : ""}>Playing</option>
            </select>

            <textarea
                id="mediaDescription-${index}"
                placeholder="Media description"
                required
            >${desc}</textarea>

            <button type="submit">Save</button>

            <button type="button" onclick="renderMediaList()">
                Cancel
            </button>
        </form>
    `;
}
function onSave(e){
    e.preventDefault();
    e.target.value = "edit";
    e.target.innerHTML = "Edit";

    const index = e.target.dataset.index;
    
    const name = document.getElementById("mediaName-" + index).value;
    const desc = document.getElementById("mediaDescription-" + index).value;
    const type = document.getElementById("mediaType-" + index).value;
    const status = document.getElementById("mediaStatus-" + index).value;



    mediaList[index] = {
        name: name,
        desc: desc,
        type: type,
        status: status
    };

    localStorage.setItem('mediaList', JSON.stringify(mediaList));
    renderMediaList();

}



function onCreateCategory(e){
    e.preventDefault();
    const category = document.getElementById("categoryName");
    const categoryName = category.value;
    category.value = "";
    document.getElementById("mediaType").insertAdjacentHTML("beforeend", `<option value="${categoryName}">${categoryName}</option>`);
    console.log(categoryName);
}  
const storedMediaList = localStorage.getItem('mediaList');
if (storedMediaList) {
    mediaList = JSON.parse(storedMediaList);
}

function renderMediaList() {
    const mediaListContainer = document.getElementById("media-list");
    mediaListContainer.innerHTML = '';
    mediaList.forEach(function(media,index) {
        mediaListContainer.insertAdjacentHTML("beforeend", `
            <div class="media-item" id="media-item-${index}">
                <h1 id="media-name-${index}">${media.name}</h1>
                <p id="media-description-${index}">${media.desc}</p>
                <div class="media-details">
                    <p id="media-type-${index}">${media.type}</p>
                    <p id="media-status-${index}">${media.status}</p>
                    <button type="button" value="delete" class="delete-btn" onclick="ondelete(event)" data-index="${index}">Delete</button>
                    <button type="button" value="edit" class="edit-btn" onclick="onEdit(event)" data-index="${index}">Edit</button>
                </div>
            </div>
        `);
    });
}

renderMediaList();