const SUPABASE_URL = "https://vkvpkmtdwteargqeewzg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FiF92efiMWo8IcLgtz8n6g_Eaqpm3HA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const myForm = document.getElementById("myForm");




const categoryForm = document.getElementById("categoryForm");

categoryForm.addEventListener("submit", onCreateCategory);

async function addMedia(name, desc, type, status) {

    const { data, error } = await supabaseClient
        .from("media")
        .insert({
            name: name,
            description: desc,
            type: type,
            status: status
        })
        .select();

    if (error) {
        console.error("Error adding media:", error);
        alert("Could not add media.");
        return;
    }

    console.log("Added to Supabase:", data);

    await loadMedia();
}

let mediaList = [];
let categories = [];

myForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById("mediaName").value;
    const desc = document.getElementById("mediaDescription").value;
    const type = document.getElementById("mediaType").value;
    const status = document.getElementById("mediaStatus").value;

    await addMedia(name, desc, type, status);

    myForm.reset();
});

async function ondelete(e) {
    e.preventDefault();

    const id = e.target.dataset.id;

    const { error } = await supabaseClient
        .from("media")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting media:", error);
        return;
    }

    loadMedia();
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

async function onSave(e) {
    e.preventDefault();

    const index = e.target.dataset.index;

    const name = document.getElementById(
        "mediaName-" + index
    ).value;

    const desc = document.getElementById(
        "mediaDescription-" + index
    ).value;

    const type = document.getElementById(
        "mediaType-" + index
    ).value;

    const status = document.getElementById(
        "mediaStatus-" + index
    ).value;

    const id = mediaList[index].id;

    const { error } = await supabaseClient
        .from("media")
        .update({
            name: name,
            description: desc,
            type: type,
            status: status
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating media:", error);
        return;
    }

    await loadMedia();
}



async function onCreateCategory(e) {
    e.preventDefault();

    const categoryInput = document.getElementById("categoryName");
    const categoryName = categoryInput.value.trim();

    if (!categoryName) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("categories")
        .insert([
            {
                name: categoryName
            }
        ])
        .select();

    if (error) {
        console.error("Error creating category:", error);
        return;
    }

    console.log("Category created:", data);

    categoryInput.value = "";

    loadCategories();
}

async function loadMedia() {

    const { data, error } = await supabaseClient
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading media:", error);
        alert("Could not load media.");
        return;
    }

    console.log("Loaded from Supabase:", data);

    mediaList = data.map(media => ({
        id: media.id,
        name: media.name,
        desc: media.description,
        type: media.type,
        status: media.status
    }));

    renderMediaList();
}

async function loadCategories() {
    const { data, error } = await supabaseClient
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error loading categories:", error);
        return;
    }

    const mediaType = document.getElementById("mediaType");

    // Remove custom categories while keeping the default ones
    mediaType.querySelectorAll(".custom-category").forEach(option => {
        option.remove();
    });

    data.forEach(category => {
        const option = document.createElement("option");

        option.value = category.name;
        option.textContent = category.name;
        option.classList.add("custom-category");

        mediaType.appendChild(option);
    });
}

function renderMediaList() {
    const mediaListContainer = document.getElementById("media-list");

    mediaListContainer.innerHTML = '';

    mediaList.forEach(function(media, index) {

        mediaListContainer.insertAdjacentHTML("beforeend", `
            <div class="media-item" id="media-item-${index}">

                <h1 id="media-name-${index}">
                    ${media.name}
                </h1>

                <p id="media-description-${index}">
                    ${media.desc}
                </p>

                <div class="media-details">

                    <p id="media-type-${index}">
                        ${media.type}
                    </p>

                    <p id="media-status-${index}">
                        ${media.status}
                    </p>

                    <button
                        type="button"
                        class="delete-btn"
                        onclick="ondelete(event)"
                        data-id="${media.id}">
                        Delete
                    </button>

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="onEdit(event)"
                        data-index="${index}">
                        Edit
                    </button>

                </div>

            </div>
        `);
    });
}

loadMedia();
loadCategories();

async function testSupabase() {
    console.log("Testing Supabase...");

    const { data, error } = await supabaseClient
        .from("media")
        .select("*");

    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);
}

testSupabase();