
function onEdit2(e){
    e.preventDefault();
    const index = e.target.dataset.index;


    const name = document.getElementById("mediaName2").value;
    const desc = document.getElementById("mediaDescription2").value;
    const type = document.getElementById("mediaType2").value;
    const status = document.getElementById("mediaStatus2").value;

    mediaList[index] = {
        name: name,
        desc: desc,
        type: type,
        status: status
    };

}
    

function onEdit(e){
    e.preventDefault();

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
    
    if (e.target.value === "edit") {
        e.target.value = "save";
        e.target.innerHTML = "Save";
        document.getElementById("mediaName-" + index).innerHTML = `
            <div>
            <input id="mediaName2" type="text" placeholder="Media name" required></input>
            <select id="mediaType2" required>
                <option value="books">Books</option>
                <option value="movies">Movies</option>
                <option value="manga">Manga</option>
                <option value="anime">Anime</option>
                <option value="games">Games</option>
            </select>
            <select id="mediaStatus2" required>
                <option value="want-to-watch">Want to Watch</option>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="playing">Playing</option>
            </select>
            <textarea id="mediaDescription2"  type="text" placeholder="Media description" required></textarea>
            <button onclick="onEdit2(event)" data-index="${index}" value="edit">Edit</button>
            </div>
        `;

    } else {
        e.target.value = "edit";
        e.target.innerHTML = "Edit";
    }
    

    // edit list




    localStorage.setItem('mediaList', JSON.stringify(mediaList));
    renderMediaList();
};


function onEdit(e){
    e.preventDefault();
    e.target.value = "save";
    e.target.innerHTML = "Save";

    const index = e.target.dataset.index;

    const name = document.getElementById("mediaName-" + index).value;
    const desc = document.getElementById("mediaDescription-" + index).value;
    const type = document.getElementById("mediaType-" + index).value;
    const status = document.getElementById("mediaStatus-" + index).value;

    const mediaItem = document.getElementById("media-item-" + index);
    
    mediaItem.innerHTMssL = `
    <form id="myForm">
            <h1>Add Media</h1>
            <input id="mediaName-${index}" type="text" placeholder="Media name" required></input>
            <select id="mediaType-${index}" required>
                <option value="books">Books</option>
                <option value="movies">Movies</option>
                <option value="manga">Manga</option>
                <option value="anime">Anime</option>
                <option value="games">Games</option>
            </select>
            <select id="mediaStatus-${index}" required>
                <option value="want-to-watch">Want to Watch</option>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="playing">Playing</option>
            </select>
            <textarea id="mediaDescription-${index}"  type="text" placeholder="Media description" required></textarea>
            <button type="submit">+ Add to Libary</button>
        </form >
    `;

}