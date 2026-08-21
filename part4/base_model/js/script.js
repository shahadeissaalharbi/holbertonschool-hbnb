<<<<<<< Updated upstream
const API_URL = 'http://127.0.0.1:5000/api/v1';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('place_id');
}

document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');
    if (loginLink) {
        loginLink.style.display = token ? 'none' : 'block';
    }
     applyAdminOnlyVisibility();
});

/**
 * Shows any element with the "admin-only-link" class
 * only when the logged-in user's token has is_admin = true.
 */
function applyAdminOnlyVisibility() {
    const token = getCookie('token');
    const adminLinks = document.querySelectorAll('.admin-only-link');

    let userIsAdmin = false;
    if (token) {
        try {
            const base64Payload = token.split('.')[1];
            const decoded = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
            userIsAdmin = decoded.is_admin === true;
        } catch (error) {
            userIsAdmin = false;
        }
    }

    adminLinks.forEach((link) => {
        link.style.display = userIsAdmin ? 'inline-block' : 'none';
    });
}
=======
const API_URL = 'http://127.0.0.1:5000/api/v1';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('place_id');
}

/**
 * Decodes the JWT payload client-side to read the is_admin claim.
 * This is only used for UI gating (showing/hiding elements); the
 * server independently enforces the same rule on every request.
 * Shared across pages so admin-only UI can be toggled consistently.
 */
function isAdminUser(token) {
    if (!token) return false;
    try {
        const base64Payload = token.split('.')[1];
        const decoded = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.is_admin === true;
    } catch (error) {
        return false;
    }
}

/**
 * Shows the "Admin" nav tab (and its dropdown) if the current user
 * is an authenticated admin, hides it otherwise. Safe to call on
 * any page — it no-ops if the admin nav markup isn't present.
 */
function setupAdminNav(token) {
    const adminTab = document.getElementById('admin-tab');
    if (!adminTab) return;
    adminTab.style.display = isAdminUser(token) ? 'block' : 'none';
}

/**
 * Toggles the admin dropdown open/closed on click, and closes it
 * when the user clicks anywhere outside the tab.
 */
function setupAdminDropdownToggle() {
    const adminTab = document.getElementById('admin-tab');
    if (!adminTab) return;
    const toggleBtn = adminTab.querySelector('.admin-tab-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        adminTab.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!adminTab.contains(event.target)) {
            adminTab.classList.remove('open');
        }
    });
}

/**
 * Shows the "Add Place" nav link for any authenticated user
 * (place creation isn't admin-restricted — the logged-in user
 * becomes the owner). Safe to call on any page.
 */
function setupAddPlaceNav(token) {
    const addPlaceLink = document.getElementById('add-place-link');
    if (!addPlaceLink) return;
    addPlaceLink.style.display = token ? 'inline-block' : 'none';
}

/**
 * Clears the auth cookie and sends the user back to the home page.
 */
function handleLogout(event) {
    event.preventDefault();
    document.cookie = 'token=; path=/; max-age=0';
    window.location.href = 'home.html';
}

/**
 * Toggles Login vs Logout in the nav based on auth state, and wires
 * up the logout click handler. Safe to call on any page — no-ops if
 * the markup isn't present.
 */
function setupAuthLinks(token) {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (loginLink) {
        loginLink.style.display = token ? 'none' : 'block';
    }
    if (logoutLink) {
        logoutLink.style.display = token ? 'block' : 'none';
    }
}

/**
 * Re-checks login/admin state and updates the nav accordingly.
 * Called on normal page load AND on bfcache restores (see below).
 */
function refreshNavState() {
    const token = getCookie('token');
    setupAuthLinks(token);
    setupAdminNav(token);
    setupAddPlaceNav(token);
}

document.addEventListener('DOMContentLoaded', () => {
    refreshNavState();
    setupAdminDropdownToggle();

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
});

/**
 * Browsers restore a page from the back/forward cache (bfcache) on
 * back/forward navigation without re-firing DOMContentLoaded, so the
 * nav would otherwise keep showing whatever state it had when the
 * page was cached (e.g. still showing the Admin tab after logging
 * out and navigating back). `pageshow` fires on both a normal load
 * and a bfcache restore, so re-running the check here keeps it
 * accurate either way.
 */
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        refreshNavState();
    }
});
>>>>>>> Stashed changes
