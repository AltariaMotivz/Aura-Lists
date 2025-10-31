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
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// This is the new spell! It tells the script to wait until the HTML is fully built.
document.addEventListener("DOMContentLoaded", () => {

    // === 1. GATHER ALL OUR MAGICAL TOOLS (ELEMENTS) ===
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const dashboardPage = document.getElementById('dashboard-page');
    const myWishlistPage = document.getElementById('my-wishlist-page');
    const friendWishlistPage = document.getElementById('friend-wishlist-page');
    const phoneForm = document.getElementById('phone-form');
    const phoneNumberInput = document.getElementById('phone-number');
    const codeForm = document.getElementById('code-form');
    const codeInput = document.getElementById('code-input');
    const authStatus = document.getElementById('auth-status');
    const signOutButton = document.getElementById('sign-out-button');
    const userFriendIdElement = document.getElementById('user-friend-id');
    const dashboardNavBtn = document.getElementById('dashboard-nav-btn');
    const myWishlistNavBtn = document.getElementById('my-wishlist-nav-btn');
    const addWishModalBackdrop = document.getElementById('addWishModalBackdrop');
    const openAddWishModalBtn = document.getElementById('openAddWishModalBtn');
    const addWishForm = document.getElementById('addWishForm');
    const cancelWishBtn = document.getElementById('cancelWishBtn');
    const wishlistGrid = document.getElementById('wishlistGrid');
    const loadingMessage = document.getElementById('loadingMessage');
    const addFriendModalBackdrop = document.getElementById('addFriendModalBackdrop');
    const addFriendBtn = document.getElementById('addFriendBtn');
    const addFriendForm = document.getElementById('addFriendForm');
    const cancelFriendBtn = document.getElementById('cancelFriendBtn');
    const friendIdInput = document.getElementById('friendIdInput');
    const addFriendStatus = document.getElementById('add-friend-status');
    const friendWishlistTitle = document.getElementById('friend-wishlist-title');
    const friendWishlistGridContainer = document.getElementById('friendWishlistGrid');

    // === 2. PREPARE OUR MAGICAL GLOBALS ===
    let confirmationResult = null;
    let currentUser = null;
    let friendsUnsubscribe = null;
    let wishesUnsubscribe = null;

    // === 3. DEFINE ALL OUR SPELLS (FUNCTIONS) BEFORE WE USE THEM ===

    // --- PAGE NAVIGATION SPELL ---
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

    // --- AUTHENTICATION SPELLS ---
    function setupRecaptcha() {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(window.auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => { /* reCAPTCHA solved */ }
            });
        } catch (error) {
            console.error("Error setting up reCAPTCHA:", error);
        }
    }

    // --- USER DOCUMENT SPELL ---
    const checkAndCreateUserDoc = async (user) => {
        const userDocRef = doc(window.db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            try {
                await setDoc(userDocRef, {
                    createdAt: new Date(),
                    phone: user.phoneNumber
                });
            } catch (error) {
                console.error("Error creating user document:", error);
            }
        }
    };

    // --- WISH MANAGEMENT SPELLS ---
    function fetchMyWishes(userId) {
        const q = query(collection(window.db, "wishes"), where("ownerId", "==", userId));
        return onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                loadingMessage.textContent = "Your meadow is empty. Add your first wish!";
                 wishlistGrid.innerHTML = '';
                return;
            }
            wishlistGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const wish = doc.data();
                const wishId = doc.id;
                const card = createWishCard(wish, wishId, true);
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
            const deleteBtn = card.querySelector('.delete-wish-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    await deleteDoc(doc(window.db, "wishes", wishId));
                });
            }
        } else {
            const claimBtn = card.querySelector('.claim-wish-btn');
            if (claimBtn) {
                claimBtn.addEventListener('click', async () => {
                    await updateDoc(doc(window.db, "wishes", wishId), { claimedBy: currentUser.uid });
                });
            }
            
            const unclaimBtn = card.querySelector('.unclaim-wish-btn');
            if (unclaimBtn) {
                unclaimBtn.addEventListener('click', async () => {
                    await updateDoc(doc(window.db, "wishes", wishId), { claimedBy: null });
                });
            }
        }
        return card;
    }

    // --- FRIEND MANAGEMENT SPELLS ---
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
        
        const viewBtn = card.querySelector('button');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                showFriendWishlist(friendId);
            });
        }
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
                const card = createWishCard(wish, wishId, false);
                friendWishlistGridContainer.appendChild(card);
            });
        });
    }

    // === 4. CAST OUR INITIAL SPELLS (EVENT LISTENERS) ===
    // Now these spells are safely inside the DOMContentLoaded wrapper!
    setupRecaptcha(); 

    dashboardNavBtn.addEventListener('click', () => showPage('dashboard'));
    myWishlistNavBtn.addEventListener('click', () => showPage('my-wishlist'));

    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = phoneNumberInput.value;
        authStatus.textContent = 'Sending code...';
        try {
            if (!window.recaptchaVerifier) setupRecaptcha();
            confirmationResult = await signInWithPhoneNumber(window.auth, phoneNumber, window.recaptchaVerifier);
            phoneForm.classList.add('hidden');
            codeForm.classList.remove('hidden');
            authStatus.textContent = 'Verification code sent!';
        } catch (error) {
            console.error("A pixie blocked the message!", error);
            authStatus.textContent = `Error: Could not send code. Please check the number and try again.`;
            setupRecaptcha();
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

    openAddWishModalBtn.addEventListener('click', () => addWishModalBackdrop.style.display = 'flex');
    cancelWishBtn.addEventListener('click', () => addWishModalBackdrop.style.display = 'none');

    addWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        const wish = { /* ... (form data) ... */ };
        try {
            await addDoc(collection(window.db, "wishes"), wish);
            addWishForm.reset();
            addWishModalBackdrop.style.display = 'none';
        } catch (error) { /* ... */ }
    });

    addFriendBtn.addEventListener('click', () => addFriendModalBackdrop.style.display = 'flex');
    cancelFriendBtn.addEventListener('click', () => addFriendModalBackdrop.style.display = 'none');

    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const friendId = friendIdInput.value.trim();
        if (!currentUser || !friendId || friendId === currentUser.uid) { /* ... */ return; }
        addFriendStatus.textContent = "Verifying friend...";
        try {
            const userDoc = await getDoc(doc(window.db, "users", friendId));
            if (!userDoc.exists()) { /* ... */ return; }
            const friendRef = doc(window.db, `users/${currentUser.uid}/friends`, friendId);
            await setDoc(friendRef, { addedAt: new Date(), friendName: "A Friend" });
            addFriendStatus.textContent = "Friend added successfully!";
            /* ... (reset form) ... */
        } catch (error) { /* ... */ }
    });

    // === 5. THE GREAT AWAKENING SPELL (onAuthStateChanged) ===
    onAuthStateChanged(window.auth, (user) => {
        if (user) {
            currentUser = user;
            checkAndCreateUserDoc(user);
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userFriendIdElement.textContent = user.uid;
            userFriendIdElement.onclick = () => navigator.clipboard.writeText(user.uid);
            showPage('dashboard');
            wishesUnsubscribe = fetchMyWishes(user.uid);
            friendsUnsubscribe = fetchFriends(user.uid);
        } else {
            currentUser = null;
            if (wishesUnsubscribe) wishesUnsubscribe();
            if (friendsUnsubscribe) friendsUnsubscribe();
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            /* ... (reset auth UI) ... */
        }
        setupRecaptcha();
    });

}); // End of the DOMContentLoaded spell

