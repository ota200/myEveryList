const SUPABASE_URL = "https://vkvpkmtdwteargqeewzg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FiF92efiMWo8IcLgtz8n6g_Eaqpm3HA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


const myForm =
    document.getElementById("myForm");

const categoryForm =
    document.getElementById("categoryForm");

const loginForm =
    document.getElementById("loginForm");

const signupButton =
    document.getElementById("signupButton");

const logoutButton =
    document.getElementById("logoutButton");

const authMessage =
    document.getElementById("authMessage");

const authSection =
    document.getElementById("auth-section");

const userSection =
    document.getElementById("user-section");

const mediaSection =
    document.getElementById("media-section");

const userEmail =
    document.getElementById("userEmail");


// ============================================
// LOCAL STATE
// ============================================

let mediaList = [];

let categories = [];


// ============================================
// AUTHENTICATION
// ============================================


// LOGIN

loginForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            authMessage.textContent =
                error.message;

            return;
        }


        console.log(
            "Logged in:",
            data.user
        );


        authMessage.textContent =
            "Successfully logged in.";

    }
);


// CREATE ACCOUNT

signupButton.addEventListener(
    "click",
    async function () {

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        if (!email || !password) {

            authMessage.textContent =
                "Enter an email and password first.";

            return;
        }


        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password

            });


        if (error) {

            console.error(
                "Signup error:",
                error
            );

            authMessage.textContent =
                error.message;

            return;
        }


        console.log(
            "Account created:",
            data
        );


        authMessage.textContent =
            "Account created. Check your email if confirmation is required.";

    }
);


// LOGOUT

logoutButton.addEventListener(
    "click",
    async function () {

        const { error } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return;
        }


        mediaList = [];

        categories = [];

        renderMediaList();

    }
);


// ============================================
// AUTH STATE
// ============================================

async function checkAuth() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    updateUI(user);

}


// ============================================
// UPDATE UI BASED ON USER
// ============================================

async function updateUI(user) {

    if (user) {

        console.log(
            "Logged in as:",
            user.email
        );


        userEmail.textContent =
            user.email;


        userSection.style.display =
            "block";


        mediaSection.style.display =
            "block";


        logoutButton.style.display =
            "inline-block";


        signupButton.style.display =
            "none";


        loginForm.style.display =
            "none";


        authMessage.textContent =
            "";


        await loadMedia();

        await loadCategories();

    }

    else {

        console.log(
            "No user logged in."
        );


        userSection.style.display =
            "none";


        mediaSection.style.display =
            "none";


        logoutButton.style.display =
            "none";


        signupButton.style.display =
            "inline-block";


        loginForm.style.display =
            "block";


        mediaList = [];

        categories = [];

        renderMediaList();

    }
}


// ============================================
// AUTH STATE LISTENER
// ============================================

supabaseClient.auth.onAuthStateChange(
    async function (event, session) {

        console.log(
            "Auth event:",
            event
        );


        if (session) {

            await updateUI(
                session.user
            );

        }

        else {

            await updateUI(
                null
            );

        }

    }
);


// ============================================
// ADD MEDIA
// ============================================

async function addMedia(
    name,
    desc,
    type,
    status
) {

    // Get currently logged-in user

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "User is not logged in."
        );

        return;

    }


    // Insert media

    const { data, error } =
        await supabaseClient
            .from("media")
            .insert([

                {

                    name: name,

                    description: desc,

                    type: type,

                    status: status,

                    user_id: user.id

                }

            ])
            .select();


    if (error) {

        console.error(
            "Error adding media:",
            error
        );

        return;

    }


    console.log(
        "Added:",
        data
    );


    await loadMedia();

}


// ============================================
// MEDIA FORM
// ============================================

myForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const name =
            document
                .getElementById("mediaName")
                .value
                .trim();


        const desc =
            document
                .getElementById("mediaDescription")
                .value
                .trim();


        const type =
            document
                .getElementById("mediaType")
                .value;


        const status =
            document
                .getElementById("mediaStatus")
                .value;


        await addMedia(
            name,
            desc,
            type,
            status
        );


        myForm.reset();

    }
);


// ============================================
// LOAD MEDIA
// ============================================

async function loadMedia() {

    const {
        data,
        error
    } = await supabaseClient
        .from("media")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading media:",
            error
        );

        return;

    }


    mediaList =
        data.map(function (media) {

            return {

                id: media.id,

                name: media.name,

                desc: media.description,

                type: media.type,

                status: media.status

            };

        });


    renderMediaList();

}


// ============================================
// DELETE MEDIA
// ============================================

async function ondelete(e) {

    e.preventDefault();


    const id =
        e.target.dataset.id;


    const {
        error
    } = await supabaseClient
        .from("media")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "Error deleting media:",
            error
        );

        return;

    }


    await loadMedia();

}


// ============================================
// EDIT MEDIA
// ============================================

function onEdit(e) {

    e.preventDefault();


    const index =
        e.target.dataset.index;


    const name =
        document
            .getElementById(
                "media-name-" + index
            )
            .textContent;


    const desc =
        document
            .getElementById(
                "media-description-" + index
            )
            .textContent;


    const type =
        document
            .getElementById(
                "media-type-" + index
            )
            .textContent;


    const status =
        document
            .getElementById(
                "media-status-" + index
            )
            .textContent;


    const mediaItem =
        document.getElementById(
            "media-item-" + index
        );


    mediaItem.innerHTML = `

        <form
            onsubmit="onSave(event)"
            data-index="${index}"
        >

            <h2>Edit Media</h2>


            <input
                id="mediaName-${index}"
                type="text"
                value="${name}"
                placeholder="Media name"
                required
            >


            <select
                id="mediaType-${index}"
                required
            >

                <option
                    value="books"
                    ${type === "books" ? "selected" : ""}
                >
                    Books
                </option>

                <option
                    value="movies"
                    ${type === "movies" ? "selected" : ""}
                >
                    Movies
                </option>

                <option
                    value="manga"
                    ${type === "manga" ? "selected" : ""}
                >
                    Manga
                </option>

                <option
                    value="anime"
                    ${type === "anime" ? "selected" : ""}
                >
                    Anime
                </option>

                <option
                    value="games"
                    ${type === "games" ? "selected" : ""}
                >
                    Games
                </option>

            </select>


            <select
                id="mediaStatus-${index}"
                required
            >

                <option
                    value="want-to-watch"
                    ${status === "want-to-watch" ? "selected" : ""}
                >
                    Want to Watch
                </option>

                <option
                    value="watching"
                    ${status === "watching" ? "selected" : ""}
                >
                    Watching
                </option>

                <option
                    value="completed"
                    ${status === "completed" ? "selected" : ""}
                >
                    Completed
                </option>

                <option
                    value="dropped"
                    ${status === "dropped" ? "selected" : ""}
                >
                    Dropped
                </option>

                <option
                    value="playing"
                    ${status === "playing" ? "selected" : ""}
                >
                    Playing
                </option>

            </select>


            <textarea
                id="mediaDescription-${index}"
                placeholder="Media description"
                required
            >${desc}</textarea>


            <button type="submit">
                Save
            </button>


            <button
                type="button"
                onclick="loadMedia()"
            >
                Cancel
            </button>

        </form>

    `;

}


// ============================================
// SAVE EDITED MEDIA
// ============================================

async function onSave(e) {

    e.preventDefault();


    const index =
        e.target.dataset.index;


    const name =
        document
            .getElementById(
                "mediaName-" + index
            )
            .value
            .trim();


    const desc =
        document
            .getElementById(
                "mediaDescription-" + index
            )
            .value
            .trim();


    const type =
        document
            .getElementById(
                "mediaType-" + index
            )
            .value;


    const status =
        document
            .getElementById(
                "mediaStatus-" + index
            )
            .value;


    const id =
        mediaList[index].id;


    const {
        error
    } = await supabaseClient
        .from("media")
        .update({

            name: name,

            description: desc,

            type: type,

            status: status

        })
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "Error updating media:",
            error
        );

        return;

    }


    await loadMedia();

}


// ============================================
// RENDER MEDIA
// ============================================

function renderMediaList() {

    const mediaListContainer =
        document.getElementById(
            "media-list"
        );


    mediaListContainer.innerHTML = "";


    mediaList.forEach(
        function (media, index) {

            mediaListContainer.insertAdjacentHTML(
                "beforeend",

                `

                <div
                    class="media-item"
                    id="media-item-${index}"
                >

                    <h2
                        id="media-name-${index}"
                    >
                        ${media.name}
                    </h2>


                    <p
                        id="media-description-${index}"
                    >
                        ${media.desc}
                    </p>


                    <div class="media-details">

                        <p
                            id="media-type-${index}"
                        >
                            ${media.type}
                        </p>


                        <p
                            id="media-status-${index}"
                        >
                            ${media.status}
                        </p>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="ondelete(event)"
                            data-id="${media.id}"
                        >
                            Delete
                        </button>


                        <button
                            type="button"
                            class="edit-btn"
                            onclick="onEdit(event)"
                            data-index="${index}"
                        >
                            Edit
                        </button>

                    </div>

                </div>

                `

            );

        }
    );

}


// ============================================
// CREATE CATEGORY
// ============================================

async function onCreateCategory(e) {

    e.preventDefault();


    const categoryInput =
        document.getElementById(
            "categoryName"
        );


    const categoryName =
        categoryInput.value.trim();


    if (!categoryName) {

        return;

    }


    // Get logged-in user

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "User is not logged in."
        );

        return;

    }


    // Add category to Supabase

    const {
        data,
        error
    } = await supabaseClient
        .from("categories")
        .insert([

            {

                name: categoryName,

                user_id: user.id

            }

        ])
        .select();


    if (error) {

        console.error(
            "Error creating category:",
            error
        );

        return;

    }


    console.log(
        "Category created:",
        data
    );


    categoryInput.value = "";


    await loadCategories();

}


// ============================================
// CATEGORY FORM
// ============================================

categoryForm.addEventListener(
    "submit",
    onCreateCategory
);


// ============================================
// LOAD CATEGORIES
// ============================================

async function loadCategories() {

    const {
        data,
        error
    } = await supabaseClient
        .from("categories")
        .select("*")
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading categories:",
            error
        );

        return;

    }


    categories = data;


    const mediaType =
        document.getElementById(
            "mediaType"
        );


    // Remove previously loaded custom categories

    mediaType
        .querySelectorAll(
            ".custom-category"
        )
        .forEach(
            option => option.remove()
        );


    // Add categories from Supabase

    data.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.name;


            option.textContent =
                category.name;


            option.classList.add(
                "custom-category"
            );


            mediaType.appendChild(
                option
            );

        }
    );

}


// ============================================
// START APPLICATION
// ============================================

checkAuth();