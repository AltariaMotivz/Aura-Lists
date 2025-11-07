// Import all the magical spells from our Firebase scrolls
import { 
    doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, 
    onSnapshot, collection, query, where, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
    onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === The Grand Enchantment: Wait for the Castle to be Built ===
// We wait for the HTML blueprint to be fully drawn before casting our spells.
document.addEventListener("DOMContentLoaded", () => {
    
    // --- Magical Tools (Our Global Variables) ---
    const db = window.db;
    const auth = window.auth;
    let currentUser = null;
    let recaptchaVerifier = null;
    let friendWishlistUnsubscribe = null; // To stop listening when we log out

    // --- Summoning Our Magical Elements (Duplicates Banished!) ---
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
    const userFriendId = document.getElementById('userFriendId');
    const nameForm = document.getElementById('name-form');
    const nameInput = document.getElementById('name-input');
    const nameStatus = document.getElementById('name-status');
    const friendWishlistGridContainer = document.getElementById('friendWishlistGridContainer');
    const friendsLoadingMessage = document.getElementById('friendsLoadingMessage');

    // My Wishlist Page
    const wishlistGrid = document.getElementById('wishlistGrid');
    const loadingMessage = document.getElementById('loadingMessage');
    const addWishBtn = document.getElementById('addWishBtn');

    // Add Wish Modal
    const addWishModalBackdrop = document.getElementById('addWishModalBackdrop');
    const addWishForm = document.getElementById('addWishForm');
    const cancelAddWishBtn = document.getElementById('cancelAddWishBtn');
    
    // Add Friend Modal
    const addFriendBtn = document.getElementById('addFriendBtn');
    const addFriendModalBackdrop = document.getElementById('addFriendModalBackdrop');
    const addFriendForm = document.getElementById('addFriendForm');
    const friendIdInput = document.getElementById('friendIdInput');
    const cancelAddFriendBtn = document.getElementById('cancelAddFriendBtn');
    const addFriendStatus = document.getElementById('addFriendStatus');

    // Friend's Wishlist Modal
    const friendWishlistModalBackdrop = document.getElementById('friendWishlistModalBackdrop');
    const friendWishlistTitle = document.getElementById('friendWishlistTitle');
    const friendWishlistContainer = document.getElementById('friendWishlistContainer');
    const closeFriendWishlistBtn = document.getElementById('closeFriendWishlistBtn');

    // --- The Gateway Spells (Authentication) ---

    // Spell to build the invisible reCAPTCHA Guardian
    function setupRecaptcha() {
        if (recaptchaVerifier) {
            recaptchaVerifier.clear(); // Clear old one if it exists
        }
        try {
            recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow sign-in
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

    // Spell to send the SMS code
    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = phoneNumberInput.value;
        if (!recaptchaVerifier) {
            console.log("Guardian not ready, summoning...");
            setupRecaptcha(); // Ensure it's ready
        }
        
        signInButton.disabled = true;
        authStatus.textContent = "Sending verification code...";
        authStatus.style.color = "var(--text-muted)";

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            // Store the confirmation result to use later
            window.confirmationResult = confirmationResult;
            authStatus.textContent = "Code sent! Please check your phone.";
            authStatus.style.color = "var(--text-dark)";
            phoneForm.classList.add('hidden');
            codeForm.classList.remove('hidden');
        } catch (error) {
            console.error("A pixie blocked the message!", error);
            authStatus.textContent = `Error: ${error.message}`;
            authStatus.style.color = "var(--fairy-accent)";
            // Reset reCAPTCHA for a new attempt
            setupRecaptcha();
        } finally {
            signInButton.disabled = false;
        }
    });

    // Spell to verify the code
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
            // User signed in successfully.
            console.log("You are in! User:", result.user);
            // The onAuthStateChanged listener will handle the rest.
        } catch (error) {
            console.error("Pixie stole the code!", error);
            authStatus.textContent = "Error: Invalid code. Please try again.";
            authStatus.style.color = "var(--fairy-accent)";
        } finally {
            verifyCodeButton.disabled = false;
        }
    });

    // Spell to sign out of the kingdom
    signOutButton.addEventListener('click', () => {
        signOut(auth).catch((error) => {
            console.error("Could not sign out:", error);
        });
    });

    // --- The Grand Listener (Main App Logic) ---
    // This spell listens for the user entering or leaving the kingdom
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User has entered the kingdom!
            currentUser = user;
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            
            // Summon all their magic!
            checkAndCreateUserDoc(user);
            displayUserFriendId(user.uid);
            fetchMyWishes(user.uid);
            fetchFriends(user.uid);
            
            // Set up the "Save Name" spell
            setupNameForm(user.uid);

        } else {
            // User has left the kingdom.
            currentUser = null;
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            
            // Clean up old magic
            if(wishlistGrid) wishlistGrid.innerHTML = '';
            if(friendWishlistGridContainer) friendWishlistGridContainer.innerHTML = '';
            if (friendWishlistUnsubscribe) {
                friendWishlistUnsubscribe(); // Stop listening to friend changes
            }
            
            // Reset the forms
            phoneForm.classList.remove('hidden');
            codeForm.classList.add('hidden');
            phoneNumberInput.value = '';
            codeInput.value = '';
            authStatus.textContent = '';
            
            // Summon a new Guardian for the next visitor
            setupRecaptcha();
        }
    });

    // --- The Royal Scribe Spells (User Profile) ---

    // Spell to check the Royal Registry
    // If the user is new, we add them to the 'users' collection
    async function checkAndCreateUserDoc(user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            // User is new! Create their document in the registry.
            // NEW: We give them their phone number as a default name.
            await setDoc(userRef, {
                phone: user.phoneNumber,
                displayName: user.phoneNumber, // Default name
                createdAt: new Date()
            });
            nameInput.value = user.phoneNumber; // Set in the form
        } else {
            // User is returning.
            // NEW: Set their current name in the form.
            const userData = userDoc.data();
            nameInput.value = userData.displayName || ''; // Show current name
        }
    }
    
    // Spell to show the user's Friend ID
    function displayUserFriendId(uid) {
        userFriendId.textContent = uid;
    }

    // NEW: Spell to save the user's chosen name
    function setupNameForm(uid) {
        nameForm.onsubmit = async (e) => { // Use onsubmit to avoid multiple listeners
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
        addWishBtn.classList.add('hidden'); // Hide float button by default

        if (page === 'dashboard') {
            dashboardPage.classList.remove('hidden');
            pageTitle.textContent = "Dashboard";
            dashboardTab.classList.add('active');
            myWishlistTab.classList.remove('active');
        } else if (page === 'my-wishlist') {
            myWishlistPage.classList.remove('hidden');
            addWishBtn.classList.remove('hidden'); // Show float button
            pageTitle.textContent = "My Magical Wishlist";
            myWishlistTab.classList.add('active');
            dashboardTab.classList.remove('active');
        }
    }

    dashboardTab.addEventListener('click', () => showPage('dashboard'));
    myWishlistTab.addEventListener('click', () => showPage('my-wishlist'));

    // --- My Wishlist Spells ---

    // Spell to fetch the user's own wishes
    function fetchMyWishes(uid) {
        const q = query(collection(db, "wishes"), where("ownerId", "==", uid));
        
        // Use onSnapshot to listen for real-time changes!
        onSnapshot(q, (snapshot) => {
            wishlistGrid.innerHTML = ''; // Banish old wishes
            if (snapshot.empty) {
                loadingMessage.textContent = "Your wishlist is empty. Add a wish!";
                return;
            }
            
            loadingMessage.textContent = ''; // Banish loading message
            
            snapshot.forEach((doc) => {
                const wish = doc.data();
                const wishId = doc.id;
                const wishElement = createWishCard(wish, wishId, true); // true = isOwner
                wishlistGrid.appendChild(wishElement);
            });
        });
    }

    // Spell to conjure a Wish Card
    function createWishCard(wish, wishId, isOwner = false) {
        const card = document.createElement('div');
        card.className = 'wish-card';
        // Use a placeholder if no image is provided
        const image = wish.imageUrl || `https://placehold.co/600x400/f9f7f3/e7b2a5?text=${encodeURIComponent(wish.name)}`;
        
        // Conditionally wrap the image in a link if it's a friend's list and a link exists
        let imageElement;
        if (!isOwner && wish.link) {
            // It's a friend's list and a link exists, make the image clickable!
            imageElement = `
                <a href="${wish.link}" target="_blank" rel="noopener noreferrer" aria-label="View item ${wish.name}">
                    <img src="${image}" alt="${wish.name}" onerror="this.src='https://placehold.co/600x400/f9f7f3/e7b2a5?text=Image+Not+Found'">
                </a>
            `;
        } else {
            // It's the owner's list OR there's no link, just show the image.
            imageElement = `
                <img src="${image}" alt="${wish.name}" onerror="this.src='https://placehold.co/600x400/f9f7f3/e7b2a5?text=Image+Not+Found'">
            `;
        }

        card.innerHTML = `
            ${imageElement}
            <div class="card-content">
                <h2>${wish.name}</h2>
                <p class="card-notes">${wish.notes || 'No notes for this wish.'}</p>
                ${wish.link ? `<a href="${wish.link}" class="card-link" target="_blank" rel="noopener noreferrer">View Item</a>` : ''}
            </div>
        `;

        if (isOwner) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteWish(wishId);
            
            actions.appendChild(deleteBtn);
            card.querySelector('.card-content').appendChild(actions);
        }
        
        return card;
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

    // Spell to show the "Add Wish" modal
    addWishBtn.addEventListener('click', () => {
        console.log("Magical bell has been rung! The 'Add Wish' button was clicked!");
        addWishModalBackdrop.classList.add('active');
    });

    // Spell to hide the "Add Wish" modal
    cancelAddWishBtn.addEventListener('click', () => {
        addWishModalBackdrop.classList.remove('active');
    });

    // Spell to save a new wish
    addWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const wish = {
            name: addWishForm.itemName.value,
            link: addWishForm.itemLink.value,
            notes: addWishForm.itemNotes.value,
            imageUrl: addWishForm.itemImage.value,
            ownerId: currentUser.uid,
            createdAt: new Date()
        };

        try {
            await addDoc(collection(db, "wishes"), wish);
            console.log("Wish has been cast!");
            addWishForm.reset();
            addWishModalBackdrop.classList.remove('active');
        } catch (error) {
            console.error("Error casting wish:", error);
        }
    });

    // --- Friendship Spells ---

    // Spell to show the "Add Friend" modal
    addFriendBtn.addEventListener('click', () => {
        console.log("Opening Add Friend Modal...");
        addFriendModalBackdrop.classList.add('active');
    });

    // Spell to hide the "Add Friend" modal
    cancelAddFriendBtn.addEventListener('click', () => {
        console.log("Closing Add Friend Modal...");
        addFriendModalBackdrop.classList.remove('active');
        addFriendStatus.textContent = '';
    });
    
    // Spell to add a new friend
    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const friendId = friendIdInput.value.trim();
        
        if (friendId === currentUser.uid) {
            addFriendStatus.textContent = "You cannot add yourself, silly!";
            addFriendStatus.style.color = "var(--fairy-accent)";
            return;
        }

        addFriendStatus.textContent = "Searching for friend...";
        addFriendStatus.style.color = "var(--text-muted)";

        try {
            // Check if the user exists
            const friendRef = doc(db, "users", friendId);
            const friendDoc = await getDoc(friendRef);

            if (!friendDoc.exists()) {
                addFriendStatus.textContent = "Could not find a friend with that ID.";
                addFriendStatus.style.color = "var(--fairy-accent)";
                return;
            }
            
            // Add the friend to our list
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

    // NEW: The "Town Crier" Spell to fetch and display friends
    function fetchFriends(uid) {
        const friendsCollection = collection(db, "users", uid, "friends");
        
        // Unsubscribe from old listener if it exists
        if (friendWishlistUnsubscribe) {
            friendWishlistUnsubscribe();
        }

        // Listen for changes to our friends list
        friendWishlistUnsubscribe = onSnapshot(friendsCollection, (snapshot) => {
            friendWishlistGridContainer.innerHTML = ''; // Banish old list
            if (snapshot.empty) {
                friendsLoadingMessage.textContent = "You haven't added any friends yet. Add one with the '+' button!";
                return;
            }
            
            friendsLoadingMessage.textContent = ''; // Banish loading message
            
            // For each friend, create a card
            snapshot.forEach(async (friendDoc) => {
                const friendId = friendDoc.id;
                
                // NEW MAGIC: Fetch the friend's user data to get their name!
                const friendUserDoc = await getDoc(doc(db, "users", friendId));
                let friendName = friendId; // Default to ID
                
                if (friendUserDoc.exists()) {
                    friendName = friendUserDoc.data().displayName || friendName; // Use name if it exists
                }

                // NOW display the name
                const friendElement = document.createElement('div');
                friendElement.className = 'friend-card glass-panel';
                friendElement.innerHTML = `
                    <h4>${friendName}</h4>
                    <p>${friendId}</p>
                `;
                
                // Add a click spell to open their wishlist
                friendElement.addEventListener('click', () => {
                    openFriendWishlist(friendId, friendName);
                });
                
                friendWishlistGridContainer.appendChild(friendElement);
            });
        });
    }

    // (FIX #2) Spell to open a friend's wishlist in a modal
    async function openFriendWishlist(friendId, friendName) {
        friendWishlistTitle.textContent = `${friendName}'s Wishlist`;
        friendWishlistContainer.innerHTML = '<p>Summoning their wishes...</p>';
        friendWishlistModalBackdrop.classList.add('active');

        // Fetch the friend's wishes
        const q = query(collection(db, "wishes"), where("ownerId", "==", friendId));
        
        // We now correctly use 'getDocs' (plural) for a query
        const snapshot = await getDocs(q); 
        
        if (snapshot.empty) {
            friendWishlistContainer.innerHTML = '<p>This friend has no wishes yet!</p>';
            return;
        }

        friendWishlistContainer.innerHTML = ''; // Clear loading message
        snapshot.forEach((doc) => {
            const wish = doc.data();
            const wishId = doc.id;
            const wishElement = createWishCard(wish, wishId, false); // false = not owner
            friendWishlistContainer.appendChild(wishElement);
        });
    }

    // Spell to close the friend's wishlist modal
    closeFriendWishlistBtn.addEventListener('click', () => {
        friendWishlistModalBackdrop.classList.remove('active');
    });

}); // End of the Grand Enchantment (DOMContentLoaded)

