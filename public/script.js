import { 
    onAuthStateChanged, 
    signOut, 
    RecaptchaVerifier, 
    signInWithPhoneNumber 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Page & Element References
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const dashboardPage = document.getElementById('dashboard-page');
const myWishlistPage = document.getElementById('my-wishlist-page');
const friendWishlistPage = document.getElementById('friend-wishlist-page');

// --- AUTH ELEMENTS ---
const phoneForm = document.getElementById('phone-form');
const phoneNumberInput = document.getElementById('phone-number');
const codeForm = document.getElementById('code-form');
const codeInput = document.getElementById('code-input');
const authStatus = document.getElementById('auth-status');
const signOutButton = document.getElementById('sign-out-button');
const userFriendIdElement = document.getElementById('user-friend-id');

// --- NAVIGATION ---
const dashboardNavBtn = document.getElementById('dashboard-nav-btn');
const myWishlistNavBtn = document.getElementById('my-wishlist-nav-btn');

// --- WISH MODAL ELEMENTS ---
const addWishModalBackdrop = document.getElementById('addWishModalBackdrop');
const openAddWishModalBtn = document.getElementById('openAddWishModalBtn');
const addWishForm = document.getElementById('addWishForm');
const cancelWishBtn = document.getElementById('cancelWishBtn');
const wishlistGrid = document.getElementById('wishlistGrid');
const loadingMessage = document.getElementById('loadingMessage');

// --- FRIEND MODAL ELEMENTS ---
const addFriendModalBackdrop = document.getElementById('addFriendModalBackdrop');
const addFriendBtn = document.getElementById('addFriendBtn');
const addFriendForm = document.getElementById('addFriendForm');
const cancelFriendBtn = document.getElementById('cancelFriendBtn');
const friendIdInput = document.getElementById('friendIdInput');
const addFriendStatus = document.getElementById('add-friend-status');
const friendsWishlistGrid = document.getElementById('friends-wishlist-grid');
const friendWishlistTitle = document.getElementById('friend-wishlist-title');
const friendWishlistGridContainer = document.getElementById('friendWishlistGrid');


let confirmationResult = null;
let currentUser = null;
let friendsUnsubscribe = null; // To stop listening for friend updates when logged out
let wishesUnsubscribe = null; // To stop listening for wish updates when logged out

// --- PAGE NAVIGATION LOGIC ---
function showPage(pageToShow) {
    [dashboardPage, myWishlistPage, friendWishlistPage].forEach(page => page.classList.add('hidden'));
    [dashboardNavBtn, myWishlistNavBtn].forEach(btn => btn.classList.remove('active'));
    
    if (pageToShow === 'dashboard') {
        dashboardPage.classList.remove('hidden');
        dashboardNavBtn.classList.add('active');
    } else if (pageToShow === 'my-wishlist') {
        myWishlistPage.classList.remove('hidden');
        myWishlistNavBtn.classList.add('active');
    } else if (pageToShow === 'friend-wishlist') {
        friendWishlistPage.classList.remove('hidden');
    }
}

dashboardNavBtn.addEventListener('click', () => showPage('dashboard'));
myWishlistNavBtn.addEventListener('click', () => showPage('my-wishlist'));

// --- AUTHENTICATION LOGIC ---
function setupRecaptcha() {
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(window.auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => { /* reCAPTCHA solved */ }
    });
}

phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phoneNumber = phoneNumberInput.value;
    authStatus.textContent = 'Sending code...';
    try {
        confirmationResult = await signInWithPhoneNumber(window.auth, phoneNumber, window.recaptchaVerifier);
        phoneForm.classList.add('hidden');
        codeForm.classList.remove('hidden');
        authStatus.textContent = 'Verification code sent!';
    } catch (error) {
        console.error("A pixie blocked the message!", error);
        authStatus.textContent = `Error: Could not send code. Please check the number and try again.`;
        setupRecaptcha(); // Reset reCAPTCHA on error
    }
});

codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = codeInput.value;
    authStatus.textContent = 'Verifying...';
    try {
        await confirmationResult.confirm(code);
    } catch (error) {
        console.error("Verification failed!", error);
        authStatus.textContent = "Error: Invalid code. Please try again.";
    }
});

signOutButton.addEventListener('click', () => {
    signOut(window.auth);
});

onAuthStateChanged(window.auth, (user) => {
    if (user) {
        currentUser = user;
        checkAndCreateUserDoc(user);
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userFriendIdElement.textContent = user.uid;
        userFriendIdElement.onclick = () => {
            navigator.clipboard.writeText(user.uid);
            // Optional: Show a "Copied!" message
        };
        showPage('dashboard');
        wishesUnsubscribe = fetchMyWishes(user.uid);
        friendsUnsubscribe = fetchFriends(user.uid);
    } else {
        currentUser = null;
        if (wishesUnsubscribe) wishesUnsubscribe();
        if (friendsUnsubscribe) friendsUnsubscribe();
        
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        confirmationResult = null;
        phoneForm.classList.remove('hidden');
        codeForm.classList.add('hidden');
        phoneNumberInput.value = '';
        codeInput.value = '';
        authStatus.textContent = '';
    }
    setupRecaptcha();
});

// --- WISH MANAGEMENT LOGIC ---
openAddWishModalBtn.addEventListener('click', () => addWishModalBackdrop.style.display = 'flex');
cancelWishBtn.addEventListener('click', () => addWishModalBackdrop.style.display = 'none');

addWishForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const wish = {
        name: addWishForm.itemName.value,
        link: addWishForm.itemLink.value,
        notes: addWishForm.itemNotes.value,
        image: addWishForm.itemImage.value,
        ownerId: currentUser.uid,
        createdAt: new Date(),
        claimedBy: null // New field for claiming
    };

    try {
        await addDoc(collection(window.db, "wishes"), wish);
        addWishForm.reset();
        addWishModalBackdrop.style.display = 'none';
    } catch (error) {
        console.error("Could not add wish:", error);
    }
});

function fetchMyWishes(userId) {
    const q = query(collection(window.db, "wishes"), where("ownerId", "==", userId));
    return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            loadingMessage.textContent = "Your meadow is empty. Add your first wish!";
             wishlistGrid.innerHTML = ''; // Clear old wishes
            return;
        }
        wishlistGrid.innerHTML = '';
        snapshot.forEach(doc => {
            const wish = doc.data();
            const wishId = doc.id;
            const card = createWishCard(wish, wishId, true); // true means it's my own card
            wishlistGrid.appendChild(card);
        });
    });
}

function createWishCard(wish, wishId, isMyWish) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    if(wish.claimedBy) card.classList.add('claimed');

    let actionsHtml = '';
    if (isMyWish) {
        actionsHtml = `<button class="delete-wish-btn" data-id="${wishId}">Delete</button>`;
    } else if (!wish.claimedBy) {
        actionsHtml = `<button class="claim-wish-btn" data-id="${wishId}">Claim Wish</button>`;
    } else if (wish.claimedBy === currentUser.uid) {
        actionsHtml = `<button class="unclaim-wish-btn" data-id="${wishId}">Unclaim</button>`;
    } else {
        actionsHtml = `<p class="claimed-by-other">Claimed by another friend</p>`;
    }

    card.innerHTML = `
        <img src="${wish.image || 'https://placehold.co/300x200/F3E8FF/C5A8E8?text=No+Image'}" alt="${wish.name}">
        <h3>${wish.name}</h3>
        <p>${wish.notes}</p>
        ${wish.link ? `<a href="${wish.link}" target="_blank" class="view-item-link">View Item</a>` : ''}
        <div class="wish-actions">${actionsHtml}</div>
    `;

    // Add event listeners for buttons
    if (isMyWish) {
        card.querySelector('.delete-wish-btn').addEventListener('click', async () => {
            await deleteDoc(doc(window.db, "wishes", wishId));
        });
    } else if (!wish.claimedBy || wish.claimedBy === currentUser.uid) {
        const btn = card.querySelector('.claim-wish-btn, .unclaim-wish-btn');
        if (btn) {
            btn.addEventListener('click', async () => {
                // Claim/unclaim logic would be added here
            });
        }
    }

    return card;
}

// --- FRIEND MANAGEMENT LOGIC ---
addFriendBtn.addEventListener('click', () => addFriendModalBackdrop.style.display = 'flex');
cancelFriendBtn.addEventListener('click', () => addFriendModalBackdrop.style.display = 'none');

addFriendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const friendId = friendIdInput.value.trim();
    if (!currentUser || !friendId || friendId === currentUser.uid) {
        addFriendStatus.textContent = "Please enter a valid Friend ID.";
        return;
    }
    addFriendStatus.textContent = "Verifying friend...";

    try {
        const userDoc = await getDoc(doc(window.db, "users", friendId));
        if (!userDoc.exists()) {
           addFriendStatus.textContent = "Friend ID not found.";
           return;
        }
       
        const friendRef = doc(window.db, `users/${currentUser.uid}/friends`, friendId);
        await setDoc(friendRef, { addedAt: new Date(), friendName: "A Friend" }); // Can add friend name later
        
        addFriendStatus.textContent = "Friend added successfully!";
        friendIdInput.value = '';
        setTimeout(() => {
            addFriendModalBackdrop.style.display = 'none';
            addFriendStatus.textContent = '';
        }, 1500);

    } catch (error) {
        console.error("Error adding friend:", error);
        addFriendStatus.textContent = "Could not add friend. Please check the ID.";
    }
});

function fetchFriends(userId) {
    const friendsQuery = query(collection(window.db, `users/${userId}/friends`));
    return onSnapshot(friendsQuery, (snapshot) => {
        const noFriendsMessage = document.getElementById('no-friends-message');
        if (snapshot.empty) {
            if(noFriendsMessage) noFriendsMessage.style.display = 'block';
            friendsWishlistGrid.innerHTML = '';
        } else {
             if(noFriendsMessage) noFriendsMessage.style.display = 'none';
             friendsWishlistGrid.innerHTML = '';
        }

        snapshot.forEach(friendDoc => {
            const friendId = friendDoc.id;
            const friendCard = createFriendCard(friendId);
            friendsWishlistGrid.appendChild(friendCard);
        });
    });
}

function createFriendCard(friendId) {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.innerHTML = `<p>Friend: ${friendId.substring(0, 8)}...</p><button>View Wishes</button>`;
    
    card.querySelector('button').addEventListener('click', () => {
        showFriendWishlist(friendId);
    });

    return card;
}

function showFriendWishlist(friendId) {
    friendWishlistTitle.textContent = `Wishes from Friend ${friendId.substring(0, 8)}...`;
    showPage('friend-wishlist');
    
    const q = query(collection(window.db, "wishes"), where("ownerId", "==", friendId));
    onSnapshot(q, (snapshot) => {
        friendWishlistGridContainer.innerHTML = '';
        if (snapshot.empty) {
            friendWishlistGridContainer.innerHTML = '<p>This friend has not made any wishes yet.</p>';
            return;
        }
        snapshot.forEach(doc => {
            const wish = doc.data();
            const wishId = doc.id;
            // For a friend's list, we pass 'false' for isMyWish
            const card = createWishCard(wish, wishId, false);
            friendWishlistGridContainer.appendChild(card);
        });
    });
}

// Create user document on first login if it doesn't exist
const checkAndCreateUserDoc = async (user) => {
    const userDocRef = doc(window.db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            createdAt: new Date(),
            phone: user.phoneNumber
        });
    }
};

