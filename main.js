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

const editMediaForm =
    document.getElementById("editMediaForm");

const editMediaPanel =
    document.getElementById("editMediaPanel");

const cancelEditButton =
    document.getElementById("cancelEditButton");

// ============================================
// LOCAL STATE
// ============================================

let mediaList = [];

let categories = [];

let editingMediaIndex = null;


// ============================================
// AUTHENTICATION
// ============================================


// LOGIN

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const authMessage = document.getElementById("authMessage");
    const submitButton = loginForm.querySelector(
        'button[type="submit"]'
    );

    const googleButton = document.getElementById("googleLogin");
    const githubButton = document.getElementById("githubLogin");
    const forgotPasswordLink = document.getElementById("forgotPassword");

    // Always keep the login form visible on this page.
    loginForm.style.display = "block";

    function showMessage(message) {
        authMessage.textContent = message;
    }

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading
            ? "Signing in..."
            : "Sign In";
    }

    // ----------------------------------------
    // EMAIL AND PASSWORD LOGIN
    // ----------------------------------------

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Enter your email and password.");
            return;
        }

        setLoading(true);
        showMessage("Signing in...");

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                showMessage(error.message);
                return;
            }

            if (!data.user) {
                showMessage("Unable to sign in. Please try again.");
                return;
            }

            showMessage("Login successful. Opening your library...");

            // Navigate only after successful authentication.
            window.location.assign(
                new URL("libary.html", window.location.href).href
            );
        } catch (error) {
            console.error("Login failed:", error);
            showMessage(
                "Unable to connect. Check your internet connection and try again."
            );
        } finally {
            setLoading(false);
        }
    });

    // ----------------------------------------
    // GOOGLE AND GITHUB LOGIN
    // ----------------------------------------

    async function signInWithProvider(provider) {
        googleButton.disabled = true;
        githubButton.disabled = true;

        showMessage(`Connecting to ${provider}...`);

        try {
            const redirectTo =
                new URL("libary.html", window.location.href).href;

            const { error } =
                await supabaseClient.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo
                    }
                });

            if (error) {
                showMessage(error.message);
            }

            // Successful OAuth normally redirects the browser.
        } catch (error) {
            console.error(`${provider} login failed:`, error);
            showMessage("Unable to start social login. Please try again.");
        } finally {
            googleButton.disabled = false;
            githubButton.disabled = false;
        }
    }

    googleButton.addEventListener("click", () => {
        signInWithProvider("google");
    });

    githubButton.addEventListener("click", () => {
        signInWithProvider("github");
    });

    // ----------------------------------------
    // PASSWORD RECOVERY
    // ----------------------------------------

    forgotPasswordLink.addEventListener("click", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            showMessage(
                "Enter your email address above before requesting a reset."
            );
            emailInput.focus();
            return;
        }

        forgotPasswordLink.style.pointerEvents = "none";
        showMessage("Requesting password reset...");

        try {
            const redirectTo =
                new URL("reset-password.html", window.location.href).href;

            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo
                });

            if (error) {
                showMessage(error.message);
                return;
            }

            showMessage(
                "If an account exists for this email, a password reset link will be sent."
            );
        } catch (error) {
            console.error("Password reset failed:", error);
            showMessage("Unable to request a reset. Please try again.");
        } finally {
            forgotPasswordLink.style.pointerEvents = "auto";
        }
    });
});



// CREATE ACCOUNT

if (signupButton) signupButton.addEventListener(
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

                password: password,

                options: {
                    emailRedirectTo: window.location.origin + window.location.pathname
                }

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

if (logoutButton) logoutButton.addEventListener(
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

        if (userEmail) userEmail.textContent = user.email;
        if (userSection) userSection.style.display = "block";
        if (mediaSection) mediaSection.style.display = "block";
        if (logoutButton) logoutButton.style.display = "inline-block";
        if (signupButton) signupButton.style.display = "none";
        if (loginForm) loginForm.style.display = "none";
        if (authMessage) authMessage.textContent = "";

        if (myForm) {
            await loadMedia();
            await loadCategories();
        }

    }

    else {

        console.log(
            "No user logged in."
        );

        if (userSection) userSection.style.display = "none";
        if (mediaSection) mediaSection.style.display = "none";
        if (logoutButton) logoutButton.style.display = "none";
        if (signupButton) signupButton.style.display = "inline-block";
        if (loginForm) loginForm.style.display = "block";

        mediaList = [];
        categories = [];

        renderMediaList();

        if (myForm) {
            window.location.href = "login.html";
        }

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

if (myForm) myForm.addEventListener(
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

    const media = mediaList[index];

    if (!media || !editMediaForm || !editMediaPanel) {
        return;
    }

    editingMediaIndex = Number(index);
    document.getElementById("editMediaName").value = media.name;
    document.getElementById("editMediaType").value = media.type;
    document.getElementById("editMediaStatus").value = media.status;
    document.getElementById("editMediaDescription").value = media.desc;
    editMediaPanel.hidden = false;

}


// ============================================
// SAVE EDITED MEDIA
// ============================================

async function onSave(e) {

    e.preventDefault();

    if (editingMediaIndex === null) {
        return;
    }

    const name = document.getElementById("editMediaName").value.trim();
    const desc = document.getElementById("editMediaDescription").value.trim();
    const type = document.getElementById("editMediaType").value;
    const status = document.getElementById("editMediaStatus").value;
    const id = mediaList[editingMediaIndex].id;


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

    editingMediaIndex = null;
    editMediaPanel.hidden = true;
    await loadMedia();

}

async function mediaInfo(e) {
    console.log(e);
}


// ============================================
// RENDER MEDIA
// ============================================

function renderMediaList() {

    const mediaListContainer =
        document.getElementById(
            "media-list"
        );

    if (!mediaListContainer) {
        return;
    }

    mediaListContainer.innerHTML = "";


    mediaList.forEach(
        function (media, index) {
            console.log(media, index)
            mediaListContainer.insertAdjacentHTML(
                "beforeend",

                `

                <div
                    class="media-item"
                    id="media-item-${index}"
                >
                <a href="media.html" onclick={mediaInfo(${media.name})}> View Info</a>

                    <h3
                        id="media-name-${index}"
                    >
                        ${media.name}
                    </h3>

                    <p
                        id="media-status-${index}"
                    >
                        ${media.status}
                    </p>
                    
                    <p
                        id="media-description-${index}"
                    >
                        ${media.desc}
                    </p>
                    
                    <p
                        id="media-type-${index}"
                    >
                        ${media.type}
                    </p>

                    <div class="media-details">


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

if (categoryForm) categoryForm.addEventListener(
    "submit",
    onCreateCategory
);

if (editMediaForm) editMediaForm.addEventListener(
    "submit",
    onSave
);

if (cancelEditButton) cancelEditButton.addEventListener(
    "click",
    function () {
        editingMediaIndex = null;
        editMediaPanel.hidden = true;
        editMediaForm.reset();
    }
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