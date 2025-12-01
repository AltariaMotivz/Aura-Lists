// Import all the magical spells from our Firebase scrolls
import {
    doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
    onSnapshot, collection, query, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === The Grand Enchantment: Wait for the Castle to be Built ===
document.addEventListener("DOMContentLoaded", () => {

    // --- Magical Tools (Our Global Variables) ---
    const db = window.db;
    const auth = window.auth;
    let currentUser = null;
    let recaptchaVerifier = null;
    let friendWishlistUnsubscribe = null;
    let currentFriendWishesUnsubscribe = null;

    // --- State for Editing Wishes ---
    let isEditing = false;
    let editingWishId = null;

    // --- Summoning Our Magical Elements ---
    // Auth Page
    const authContainer = document.getElementById('auth-container');
    const phoneForm = document.getElementById('phone-form');
    const phoneNumberInput = document.getElementById('phone-number');
    const signInButton = document.getElementById('sign-in-button');
    const codeForm = document.getElementById('code-form');
    const codeInput = document.getElementById('code-input');
    const verifyCodeButton = document.getElementById('verify-code-button');
    const authStatus = document.getElementById('auth-status');

    // Main App
    const appContainer = document.getElementById('app-container');
    const signOutButton = document.getElementById('sign-out-button');
    const pageTitle = document.getElementById('pageTitle');

    // Navigation Tabs
    const dashboardTab = document.getElementById('dashboardTab');
    const myWishlistTab = document.getElementById('myWishlistTab');
    const dashboardPage = document.getElementById('dashboardPage');
    const myWishlistPage = document.getElementById('myWishlistPage');

    // Dashboard Page
    const nameForm = document.getElementById('name-form');
    const nameInput = document.getElementById('name-input');
    const nameStatus = document.getElementById('name-status');
    const friendWishlistGridContainer = document.getElementById('friendWishlistGridContainer');
    const friendsLoadingMessage = document.getElementById('friendsLoadingMessage');

    // My Wishlist Page
    const wishlistGrid = document.getElementById('wishlistGrid');
    const loadingMessage = document.getElementById('loadingMessage');
    const addWishBtn = document.getElementById('addWishBtn');

    // Add/Edit Wish Modal
    const addWishModalBackdrop = document.getElementById('addWishModalBackdrop');
    const addWishForm = document.getElementById('addWishForm');
    const cancelAddWishBtn = document.getElementById('cancelAddWishBtn');
    // We grab the header and submit button to change text dynamically (Add vs Edit)
    const addWishModalTitle = document.querySelector('#addWishModalBackdrop h2');
    const addWishSubmitBtn = document.querySelector('#addWishForm button[type="submit"]');

    // Add Friend Modal
    const addFriendBtn = document.getElementById('addFriendBtn');
    const addFriendModalBackdrop = document.getElementById('addFriendModalBackdrop');
    const addFriendForm = document.getElementById('addFriendForm');
    const friendIdInput = document.getElementById('friendIdInput');
    const cancelAddFriendBtn = document.getElementById('cancelAddFriendBtn');
    const addFriendStatus = document.getElementById('addFriendStatus');

    // Friend's Wishlist Page
    const friendWishlistPage = document.getElementById('friendWishlistPage');
    const friendPageTitle = document.getElementById('friendPageTitle');
    const friendWishlistContainer = document.getElementById('friendWishlistContainer');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');

    // --- The Gateway Spells (Authentication) ---

    function setupRecaptcha() {
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
        }
        try {
            recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log("reCAPTCHA solved");
                }
            });
            console.log("Guardian (reCAPTCHA) has been summoned.");
        } catch (error) {
            console.error("Failed to summon Guardian:", error);
            authStatus.textContent = "Error: Could not start reCAPTCHA. Please refresh.";
            authStatus.style.color = "var(--fairy-accent)";
        }
    }

    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- NEW: Flexible Input Magic (Roadmap Item #3) ---
        let rawInput = phoneNumberInput.value;
        // 1. Remove all non-numeric characters (parentheses, dashes, spaces)
        let cleaned = rawInput.replace(/\D/g, '');

        // 2. If it starts with '1' (US country code), allow it. 
        // If it's 10 digits, add '1'.
        if (cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }

        // 3. Add the plus sign
        const phoneNumber = '+' + cleaned;
        console.log(`Converting "${rawInput}" to spell-ready format: ${phoneNumber}`);
        // ----------------------------------------------------

        if (!recaptchaVerifier) {
            setupRecaptcha();
        }

        signInButton.disabled = true;
        authStatus.textContent = "Sending verification code...";
        authStatus.style.color = "var(--text-muted)";

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            authStatus.textContent = "Code sent! Please check your phone.";
            authStatus.style.color = "var(--text-dark)";
            phoneForm.classList.add('hidden');
            codeForm.classList.remove('hidden');
        } catch (error) {
            console.error("A pixie blocked the message!", error);

            if (error.code === 'auth/invalid-app-credential') {
                authStatus.innerHTML = `
                    Error: App not authorized.<br>
                    <small>1. Add 'localhost' to Authorized Domains in Firebase Console.<br>
                    2. Or use a Test Phone Number (see FIREBASE_SETUP.md).</small>
                `;
            } else {
                authStatus.textContent = `Error: ${error.message}`;
            }

            authStatus.style.color = "var(--fairy-accent)";
            setupRecaptcha();
        } finally {
            signInButton.disabled = false;
        }
    });

    codeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = codeInput.value;
        verifyCodeButton.disabled = true;
        authStatus.textContent = "Verifying code...";
        authStatus.style.color = "var(--text-muted)";

        if (!window.confirmationResult) {
            authStatus.textContent = "Error: Please request a code first.";
            authStatus.style.color = "var(--fairy-accent)";
            return;
        }

        try {
            const result = await window.confirmationResult.confirm(code);
            console.log("You are in! User:", result.user);
        } catch (error) {
            console.error("Pixie stole the code!", error);
            authStatus.textContent = "Error: Invalid code. Please try again.";
            authStatus.style.color = "var(--fairy-accent)";
        } finally {
            verifyCodeButton.disabled = false;
        }
    });

    signOutButton.addEventListener('click', () => {
        signOut(auth).catch((error) => {
            console.error("Could not sign out:", error);
        });
    });

    // --- The Grand Listener (Main App Logic) ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            currentUser = user;

            // Check for ?uid= param (Guest Mode override)
            const urlParams = new URLSearchParams(window.location.search);
            const guestUid = urlParams.get('uid');

            if (guestUid && guestUid !== user.uid) {
                // Logged in user viewing someone else's public link
                // We can just show the friend view directly
                checkAndCreateUserDoc(user); // Ensure own doc exists
                fetchMyWishes(user.uid); // Fetch own wishes in background
                fetchFriends(user.uid);
                setupNameForm(user.uid);

                // Fetch guest user name and show
                const userDoc = await getDoc(doc(db, "users", guestUid));
                const guestName = userDoc.exists() ? (userDoc.data().displayName || "A Friend") : "A Friend";
                openFriendWishlist(guestUid, guestName);
            } else {
                // Normal Login Flow
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
                checkAndCreateUserDoc(user);
                fetchMyWishes(user.uid);
                fetchFriends(user.uid);
                setupNameForm(user.uid);

                // Initialize View
                showPage('dashboard');
            }

        } else {
            // No user is signed in.
            currentUser = null;

            // Check for ?uid= param (Guest Mode)
            const urlParams = new URLSearchParams(window.location.search);
            const guestUid = urlParams.get('uid');

            if (guestUid) {
                // GUEST MODE ACTIVE
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');

                // Hide private controls
                document.getElementById('sign-out-button').classList.add('hidden');
                document.getElementById('dashboardTab').classList.add('hidden');
                document.getElementById('myWishlistTab').classList.add('hidden');
                document.getElementById('addFriendBtn').classList.add('hidden');
                document.querySelector('.profile-box').classList.add('hidden');

                // Show Guest CTA
                document.getElementById('guest-cta').classList.remove('hidden');
                document.getElementById('create-own-btn').onclick = () => {
                    window.location.href = window.location.origin; // Reload to clear params and show login
                };

                // Fetch guest user name and show
                const userDoc = await getDoc(doc(db, "users", guestUid));
                const guestName = userDoc.exists() ? (userDoc.data().displayName || "A Friend") : "A Friend";
                openFriendWishlist(guestUid, guestName);

                // Hide "Back to Dashboard" since there is no dashboard
                document.getElementById('backToDashboardBtn').classList.add('hidden');

            } else {
                // Normal Signed Out State
                authContainer.classList.remove('hidden');
                appContainer.classList.add('hidden');

                if (wishlistGrid) wishlistGrid.innerHTML = '';
                if (friendWishlistGridContainer) friendWishlistGridContainer.innerHTML = '';
                if (friendWishlistUnsubscribe) friendWishlistUnsubscribe();

                phoneForm.classList.remove('hidden');
                codeForm.classList.add('hidden');
                phoneNumberInput.value = '';
                codeInput.value = '';
                authStatus.textContent = '';

                setupRecaptcha();
            }
        }
    });

    // --- The Royal Scribe Spells (User Profile) ---
    async function checkAndCreateUserDoc(user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                phone: user.phoneNumber,
                displayName: user.phoneNumber,
                createdAt: new Date()
            });
            nameInput.value = user.phoneNumber;
        } else {
            const userData = userDoc.data();
            nameInput.value = userData.displayName || '';
        }
    }



    function setupNameForm(uid) {
        nameForm.onsubmit = async (e) => {
            e.preventDefault();
            const newName = nameInput.value.trim();
            if (!newName) {
                nameStatus.textContent = "Name cannot be empty.";
                nameStatus.style.color = "var(--fairy-accent)";
                return;
            }
            nameStatus.textContent = "Saving...";
            nameStatus.style.color = "var(--text-muted)";

            const userRef = doc(db, "users", uid);
            try {
                await updateDoc(userRef, { displayName: newName });
                nameStatus.textContent = "Name saved!";
                nameStatus.style.color = "var(--text-dark)";
            } catch (error) {
                console.error("Error saving name:", error);
                nameStatus.textContent = "Error saving name.";
                nameStatus.style.color = "var(--fairy-accent)";
            }
        };
    }

    // --- Navigation Spells ---
    function showPage(page) {
        dashboardPage.classList.add('hidden');
        myWishlistPage.classList.add('hidden');
        friendWishlistPage.classList.add('hidden');
        addWishBtn.classList.add('hidden');

        if (page === 'dashboard') {
            dashboardPage.classList.remove('hidden');
            pageTitle.textContent = "Aura List";
            dashboardTab.classList.add('active');
            myWishlistTab.classList.remove('active');
            document.getElementById('shareLinkBtn').classList.add('hidden');
        } else if (page === 'my-wishlist') {
            myWishlistPage.classList.remove('hidden');
            addWishBtn.classList.remove('hidden');
            pageTitle.textContent = "My Wishlist";
            myWishlistTab.classList.add('active');
            myWishlistTab.classList.add('active');
            dashboardTab.classList.remove('active');

            // Show Share Button
            const shareBtn = document.getElementById('shareLinkBtn');
            shareBtn.classList.remove('hidden');
            shareBtn.onclick = () => {
                const url = `${window.location.origin}?uid=${currentUser.uid}`;
                navigator.clipboard.writeText(url).then(() => {
                    const originalText = shareBtn.textContent;
                    shareBtn.textContent = "Copied!";
                    setTimeout(() => shareBtn.textContent = originalText, 2000);
                });
            };

        } else if (page === 'friend-wishlist') {
            friendWishlistPage.classList.remove('hidden');
            // No tab is active when viewing a friend
            dashboardTab.classList.remove('active');
            myWishlistTab.classList.remove('active');
            document.getElementById('shareLinkBtn').classList.add('hidden');
        }
    }

    dashboardTab.addEventListener('click', () => showPage('dashboard'));
    myWishlistTab.addEventListener('click', () => showPage('my-wishlist'));

    // --- My Wishlist Spells ---

    function fetchMyWishes(uid) {
        const q = query(collection(db, "wishes"), where("ownerId", "==", uid));

        onSnapshot(q, (snapshot) => {
            wishlistGrid.innerHTML = '';
            if (snapshot.empty) {
                loadingMessage.textContent = "Your wishlist is empty. Click the + button in the bottom right to add your first wish! 👇";
                return;
            }
            loadingMessage.textContent = '';

            snapshot.forEach((doc) => {
                const wish = doc.data();
                const wishId = doc.id;
                // Owner is true here
                const wishElement = createWishCard(wish, wishId, true);
                wishlistGrid.appendChild(wishElement);
            });
        });
    }

    /**
     * === UPDATED SPELL: Create Wish Card ===
     * Handles:
     * 1. Owner View (Delete + Edit buttons, Hides Claim status)
     * 2. Friend View (Claim/Unclaim buttons, Shows Claim status)
     */
    function createWishCard(wish, wishId, isOwner = false) {
        const card = document.createElement('div');
        card.className = 'wish-card';

        // 1. Image Logic
        let imageSrc = wish.imageUrl;

        if (!imageSrc) {
            // Use the "Mystery Gift" illustration for all items without a photo
            imageSrc = 'assets/gift_placeholder.png';
        }

        let imageElement = `<img src="${imageSrc}" alt="${wish.name}" loading="lazy" decoding="async" onerror="this.src='https://placehold.co/600x400/f9f7f3/e7b2a5?text=Image+Not+Found'">`;

        // If there's a link, wrap image in link (for everyone)
        if (wish.link) {
            imageElement = `<a href="${wish.link}" target="_blank" rel="noopener noreferrer">${imageElement}</a>`;
        }

        // 2. Claim Status Logic (The Veil of Surprise)
        let claimStatusHTML = '';
        let actionButtonsHTML = '';

        if (isOwner) {
            // --- OWNER VIEW ---
            // Owner sees Edit/Delete. Owner does NOT see claim status.
            actionButtonsHTML = `
                <button class="action-btn edit-btn" data-id="${wishId}">Edit</button>
                <button class="action-btn delete-btn" data-id="${wishId}">Delete</button>
            `;
        } else {
            // --- FRIEND VIEW ---
            // Friend sees Claim logic
            if (wish.claimedBy) {
                if (currentUser && wish.claimedBy === currentUser.uid) {
                    // I claimed this!
                    claimStatusHTML = `<div class="claim-badge mine">✨ Claimed by You!</div>`;
                    actionButtonsHTML = `<button class="btn-secondary small unclaim-btn" data-id="${wishId}">Un-claim</button>`;
                } else {
                    // Someone else claimed this (OR I am a guest seeing a claimed item)
                    claimStatusHTML = `<div class="claim-badge other">🔒 Claimed by another friend</div>`;
                    // No buttons, it's taken!
                }
            } else {
                // Available!
                actionButtonsHTML = `<button class="btn-primary small claim-btn" data-id="${wishId}">✨ Claim Gift</button>`;
            }
        }

        // 3. Construct the HTML
        card.innerHTML = `
            ${imageElement}
            <div class="card-content">
                ${claimStatusHTML}
                <h2>${wish.name}</h2>
                <p class="card-notes">${wish.notes || 'No notes for this wish.'}</p>
                ${wish.link ? `<a href="${wish.link}" class="card-link" target="_blank" rel="noopener noreferrer">View Item</a>` : ''}
                <div class="card-actions">
                    ${actionButtonsHTML}
                </div>
            </div>
        `;

        // 4. Attach Event Listeners

        // Edit (Owner only)
        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) editBtn.addEventListener('click', () => openEditModal(wish, wishId));

        // Delete (Owner only)
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.onclick = () => deleteWish(wishId);

        // Claim (Friend only)
        const claimBtn = card.querySelector('.claim-btn');
        if (claimBtn) claimBtn.onclick = () => toggleClaim(wishId, true);

        // Un-claim (Friend only)
        const unclaimBtn = card.querySelector('.unclaim-btn');
        if (unclaimBtn) unclaimBtn.onclick = () => toggleClaim(wishId, false);

        return card;
    }

    /**
     * === NEW SPELL: Toggle Claim ===
     * Uses the "Veil of Surprise" Firestore rules
     */
    async function toggleClaim(wishId, isClaiming) {
        // Guest Check
        if (!currentUser) {
            alert("You must be logged in to claim a gift! Redirecting to login...");
            window.location.href = window.location.origin; // Redirect to home (login)
            return;
        }

        const wishRef = doc(db, "wishes", wishId);
        try {
            await updateDoc(wishRef, {
                // If claiming, set my UID. If unclaiming, set null.
                claimedBy: isClaiming ? currentUser.uid : null
            });
            console.log(isClaiming ? "Gift claimed!" : "Gift released!");
        } catch (error) {
            console.error("Error toggling claim:", error);
            alert("A pixie blocked that action! (Check your internet or permissions)");
        }
    }

    // Spell to delete a wish
    async function deleteWish(wishId) {
        if (!confirm("Are you sure you want to delete this wish?")) return;
        try {
            await deleteDoc(doc(db, "wishes", wishId));
            console.log("Wish banished!");
        } catch (error) {
            console.error("Error banishing wish:", error);
        }
    }

    // --- Modal Logic (Add AND Edit) ---

    // 1. Open Modal for Adding (Clean Slate)
    addWishBtn.addEventListener('click', () => {
        isEditing = false;
        editingWishId = null;

        addWishModalTitle.textContent = "Add a New Wish";
        addWishSubmitBtn.textContent = "Add Wish";

        addWishForm.reset();
        addWishModalBackdrop.classList.add('active');
    });

    // 2. Open Modal for Editing (Pre-fill)
    function openEditModal(wish, wishId) {
        isEditing = true;
        editingWishId = wishId;

        addWishModalTitle.textContent = "Edit Your Wish";
        addWishSubmitBtn.textContent = "Save Changes";

        addWishForm.itemName.value = wish.name;
        addWishForm.itemLink.value = wish.link || '';
        addWishForm.itemNotes.value = wish.notes || '';
        addWishForm.itemImage.value = wish.imageUrl || '';

        addWishModalBackdrop.classList.add('active');
    }

    cancelAddWishBtn.addEventListener('click', () => {
        addWishModalBackdrop.classList.remove('active');
    });

    // 3. Handle Form Submit (Handles both Add and Edit)
    addWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const wishData = {
            name: addWishForm.itemName.value,
            link: addWishForm.itemLink.value,
            notes: addWishForm.itemNotes.value,
            imageUrl: addWishForm.itemImage.value,
            // We do NOT update ownerId or createdAt during an edit
        };

        try {
            if (isEditing && editingWishId) {
                // === UPDATE EXISTING ===
                const wishRef = doc(db, "wishes", editingWishId);
                await updateDoc(wishRef, wishData);
                console.log("Wish updated!");
            } else {
                // === CREATE NEW ===
                wishData.ownerId = currentUser.uid;
                wishData.createdAt = new Date();
                wishData.claimedBy = null; // Ensure new wishes start unclaimed
                await addDoc(collection(db, "wishes"), wishData);
                console.log("Wish created!");
            }

            addWishForm.reset();
            addWishModalBackdrop.classList.remove('active');
        } catch (error) {
            console.error("Error saving wish:", error);
        }
    });

    // --- Friendship Spells ---

    addFriendBtn.addEventListener('click', () => {
        addFriendModalBackdrop.classList.add('active');
    });

    cancelAddFriendBtn.addEventListener('click', () => {
        addFriendModalBackdrop.classList.remove('active');
        addFriendStatus.textContent = '';
    });

    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawInput = friendIdInput.value.trim();

        // 1. Sanitize Input (Same logic as login)
        let cleaned = rawInput.replace(/\D/g, '');
        if (cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }
        const friendPhoneNumber = '+' + cleaned;

        if (friendPhoneNumber === currentUser.phoneNumber) {
            addFriendStatus.textContent = "You cannot add yourself, silly!";
            addFriendStatus.style.color = "var(--fairy-accent)";
            return;
        }

        addFriendStatus.textContent = "Searching for friend...";
        addFriendStatus.style.color = "var(--text-muted)";

        try {
            // 2. Query by Phone Number
            const q = query(collection(db, "users"), where("phone", "==", friendPhoneNumber));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                addFriendStatus.textContent = "Could not find a friend with that phone number.";
                addFriendStatus.style.color = "var(--fairy-accent)";
                return;
            }

            // 3. Get the first match (should be unique)
            const friendDoc = querySnapshot.docs[0];
            const friendId = friendDoc.id;

            // 4. Add Friend using their UID
            const myFriendRef = doc(db, "users", currentUser.uid, "friends", friendId);
            await setDoc(myFriendRef, { addedAt: new Date() });

            addFriendStatus.textContent = "Friend added successfully!";
            addFriendStatus.style.color = "var(--text-dark)";

            friendIdInput.value = '';
            setTimeout(() => {
                addFriendModalBackdrop.classList.remove('active');
                addFriendStatus.textContent = '';
            }, 1000);

        } catch (error) {
            console.error("Error adding friend:", error);
            addFriendStatus.textContent = "Error adding friend. Please try again.";
            addFriendStatus.style.color = "var(--fairy-accent)";
        }
    });

    function fetchFriends(uid) {
        const friendsCollection = collection(db, "users", uid, "friends");

        if (friendWishlistUnsubscribe) {
            friendWishlistUnsubscribe();
        }

        friendWishlistUnsubscribe = onSnapshot(friendsCollection, (snapshot) => {
            friendWishlistGridContainer.innerHTML = '';

            if (snapshot.empty) {
                friendWishlistGridContainer.innerHTML = '<p class="status-text">You haven\'t added any friends yet. Add one with the "+" button!</p>';
                return;
            }

            snapshot.forEach(async (friendDoc) => {
                const friendId = friendDoc.id;

                try {
                    const friendUserDoc = await getDoc(doc(db, "users", friendId));
                    let friendName = friendId; // Fallback to ID

                    if (friendUserDoc.exists()) {
                        const data = friendUserDoc.data();
                        // Use displayName, or phone, or fallback
                        friendName = data.displayName || data.phone || friendId;
                    }

                    const friendElement = document.createElement('div');
                    friendElement.className = 'friend-card glass-panel';
                    friendElement.innerHTML = `
                        <h4>${friendName}</h4>
                    `;

                    friendElement.addEventListener('click', () => {
                        openFriendWishlist(friendId, friendName);
                    });

                    friendWishlistGridContainer.appendChild(friendElement);
                } catch (err) {
                    console.error("Error fetching friend details:", err);
                }
            });
        }, (error) => {
            console.error("Error fetching friends list:", error);
            friendWishlistGridContainer.innerHTML = `<p class="status-text error">Error loading friends: ${error.message}</p>`;
        });
    }

    async function openFriendWishlist(friendId, friendName) {
        showPage('friend-wishlist');
        friendPageTitle.textContent = `${friendName}'s Wishlist`;
        friendWishlistContainer.innerHTML = '<p style="text-align:center; width:100%;">Summoning their wishes...</p>';

        // Unsubscribe from previous friend's wishes if any
        if (currentFriendWishesUnsubscribe) {
            currentFriendWishesUnsubscribe();
            currentFriendWishesUnsubscribe = null;
        }

        const q = query(collection(db, "wishes"), where("ownerId", "==", friendId));

        currentFriendWishesUnsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                friendWishlistContainer.innerHTML = '<p style="text-align:center; width:100%;">This friend has no wishes yet!</p>';
                return;
            }

            friendWishlistContainer.innerHTML = '';
            snapshot.forEach((doc) => {
                try {
                    const wish = doc.data();
                    const wishId = doc.id;
                    // Owner is false here
                    const wishElement = createWishCard(wish, wishId, false);
                    friendWishlistContainer.appendChild(wishElement);
                } catch (err) {
                    console.error("Error rendering wish card:", err);
                }
            });
        }, (error) => {
            console.error("Error fetching friend's wishes:", error);
            friendWishlistContainer.innerHTML = `<p class="status-text error">Error loading wishes: ${error.message}</p>`;
        });
    }

    backToDashboardBtn.addEventListener('click', () => {
        showPage('dashboard');
    });

}); // End of the Grand Enchantment (DOMContentLoaded)