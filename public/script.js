// --- This script now contains the complete magic for authentication and wish management! ---

// Import all the magical spells we will need from the Firebase libraries
const { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
const { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

// === GLOBAL VARIABLES ===
// A place to store the user's confirmation result after they get a code
window.confirmationResult = null;
let wishesUnsubscribe = null; // A function to stop listening for wishes when the user signs out

// === FINDING THE ELEMENTS ON THE PAGE ===
// -- Auth Screen Elements --
const authContainer = document.getElementById('auth-container');
const phoneForm = document.getElementById('phone-form');
const codeForm = document.getElementById('code-form');
const phoneNumberInput = document.getElementById('phone-number');
const codeInput = document.getElementById('code-input');
const signInButton = document.getElementById('sign-in-button');
const verifyCodeButton = document.getElementById('verify-code-button');
const authStatus = document.getElementById('auth-status');

// -- App Screen Elements --
const appContainer = document.getElementById('app-container');
const signOutButton = document.getElementById('sign-out-button');
const addWishBtn = document.getElementById('addWishBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const cancelBtn = document.getElementById('cancelBtn');
const addWishForm = document.getElementById('addWishForm');
const wishlistGrid = document.getElementById('wishlistGrid');
const loadingMessage = document.getElementById('loadingMessage');


// === GRAND ENCHANTMENT #1: The Royal Scribe (Authentication Logic) ===

// The main spell that watches the user's login state at all times
onAuthStateChanged(window.auth, (user) => {
    if (user) {
        // If a user is signed in...
        console.log("A friend has entered the gates! User:", user.uid);
        showAppScreen(user.uid);
    } else {
        // If no user is signed in...
        console.log("The gates are awaiting a friend.");
        showAuthScreen();
    }
});

function showAuthScreen() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    // Stop listening to old wishes if the user signs out
    if (wishesUnsubscribe) wishesUnsubscribe();
}

function showAppScreen(userId) {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    // Start listening for wishes that belong ONLY to this user
    listenForWishes(userId);
}


// A spell to set up the reCAPTCHA verifier (a magical ward from Firebase)
window.recaptchaVerifier = new RecaptchaVerifier(window.auth, 'recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
});

// A spell to be cast when the user enters their phone number
phoneForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phoneNumber = phoneNumberInput.value;
    authStatus.textContent = "Sending magical code...";

    signInWithPhoneNumber(window.auth, phoneNumber, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            authStatus.textContent = "Code sent! Please check your phone.";
            phoneForm.classList.add('hidden');
            codeForm.classList.remove('hidden');
        }).catch((error) => {
            console.error("A pixie blocked the message!", error);
            authStatus.textContent = "Error: Could not send code. Please check the number and try again.";
        });
});

// A spell to be cast when the user enters the verification code
codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = codeInput.value;
    authStatus.textContent = "Verifying code...";

    window.confirmationResult.confirm(code).then((result) => {
        // User signed in successfully. The onAuthStateChanged spell will handle the rest!
        const user = result.user;
        console.log("Verification successful! Friend is signed in.", user.uid);
        authStatus.textContent = "Success! Welcome!";
    }).catch((error) => {
        console.error("The code's magic fizzled!", error);
        authStatus.textContent = "Error: Incorrect code. Please try again.";
    });
});

// Spell to sign out
signOutButton.addEventListener('click', () => {
    signOut(window.auth).catch((error) => {
        console.error("Could not sign out:", error);
    });
});


// === GRAND ENCHANTMENT #2: Private Wish Gardens ===

// A spell to listen for wishes belonging ONLY to the current user
function listenForWishes(userId) {
    const wishesCollection = collection(window.db, 'wishes');
    // A magical query that only fetches documents where the 'ownerId' matches the current user's ID
    const userWishesQuery = query(wishesCollection, where("ownerId", "==", userId));

    wishesUnsubscribe = onSnapshot(userWishesQuery, (snapshot) => {
        wishlistGrid.innerHTML = '';
        if (snapshot.empty) {
            loadingMessage.style.display = 'block';
            loadingMessage.textContent = "Your wishlist is an open meadow. Add your first wish!";
        } else {
            loadingMessage.style.display = 'none';
            snapshot.docs.forEach(doc => {
                renderWish(doc);
            });
        }
    });
}

// A spell to save a wish WITH the owner's ID
addWishForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = window.auth.currentUser;
    if (!user) {
        console.error("Cannot add a wish, no user is signed in!");
        return;
    }

    const newWish = {
        name: addWishForm.itemName.value,
        link: addWishForm.itemLink.value,
        notes: addWishForm.itemNotes.value,
        image: addWishForm.itemImage.value || 'https://placehold.co/600x400/f9f7f3/e7b2a5?text=Glimmer',
        createdAt: new Date(),
        ownerId: user.uid // The crucial spell: stamping the wish with the owner's ID
    };

    try {
        const wishesCollection = collection(window.db, 'wishes');
        await addDoc(wishesCollection, newWish);
        closeModal();
    } catch (error) {
        console.error("A mischievous pixie interfered with the spell: ", error);
    }
});

// The spells for rendering, deleting, and modal controls remain largely the same,
// but they will now work on the user-specific wishes!
function renderWish(doc) {
    const wish = doc.data();
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.setAttribute('data-id', doc.id);
    card.innerHTML = `
        <img src="${escapeHTML(wish.image)}" alt="Preview of ${escapeHTML(wish.name)}">
        <div class="card-content">
            <h2>${escapeHTML(wish.name)}</h2>
            <p class="card-notes">${escapeHTML(wish.notes)}</p>
            <a href="${escapeHTML(wish.link)}" class="card-link" target="_blank">View Item</a>
            <div class="card-actions">
                <button class="action-btn edit-btn">Edit</button>
                <button class="action-btn delete-btn">Delete</button>
            </div>
        </div>
    `;
    wishlistGrid.appendChild(card);
}

// Event Delegation for Delete/Edit
wishlistGrid.addEventListener('click', async (event) => {
    const target = event.target;
    const card = target.closest('.wish-card');
    if (!card) return;
    const id = card.getAttribute('data-id');

    if (target.classList.contains('delete-btn')) {
        if (confirm("Are you sure you want this wish to vanish forever?")) {
            try {
                await deleteDoc(doc(window.db, 'wishes', id));
            } catch (error) { console.error("Could not delete wish:", error); }
        }
    }
    if (target.classList.contains('edit-btn')) {
        alert("The 'Edit' spell is still being perfected!");
    }
});

// --- Modal Controls ---
function openModal() { modalBackdrop.classList.add('active'); }
function closeModal() { modalBackdrop.classList.remove('active'); addWishForm.reset(); }
addWishBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) closeModal();
});

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str || '';
    return p.innerHTML;
}

