/* ==========================================================================
   HBnB - Shared configuration and authentication helpers
   ========================================================================== */

/* ==========================================================================
   API Configuration
   ========================================================================== */

const API_URL = 'http://127.0.0.1:5000/api/v1';


/* ==========================================================================
   Cookie Helpers
   ========================================================================== */

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }

    return null;
}


/* ==========================================================================
   Place ID
   ========================================================================== */

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);

    return (
        params.get('id') ||
        params.get('place_id')
    );
}


/* ==========================================================================
   Admin Authentication
   ========================================================================== */

/**
 * Decodes the JWT payload client-side to read the is_admin claim.
 *
 * This is only used for UI gating (showing/hiding elements).
 * The server must independently enforce admin permissions on every
 * protected request.
 */
function isAdminUser(token) {
    if (!token) {
        return false;
    }

    try {
        const tokenParts = token.split('.');

        if (tokenParts.length < 2) {
            return false;
        }

        const base64Payload = tokenParts[1];

        const base64 = base64Payload
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const decoded = JSON.parse(
            atob(base64)
        );

        return decoded.is_admin === true;

    } catch (error) {
        console.error(
            'Unable to decode admin status:',
            error
        );

        return false;
    }
}


/**
 * Shows elements with the "admin-only-link" class only
 * when the logged-in user is an administrator.
 */
function applyAdminOnlyVisibility() {
    const token = getCookie('token');

    const adminLinks = document.querySelectorAll(
        '.admin-only-link'
    );

    const userIsAdmin = isAdminUser(token);

    adminLinks.forEach((link) => {
        link.style.display = userIsAdmin
            ? 'inline-block'
            : 'none';
    });
}


/**
 * Shows the Admin navigation tab if the current user
 * is an authenticated administrator.
 */
function setupAdminNav(token) {
    const adminTab = document.getElementById('admin-tab');

    if (!adminTab) {
        return;
    }

    adminTab.style.display = isAdminUser(token)
        ? 'block'
        : 'none';
}


/* ==========================================================================
   Admin Dropdown
   ========================================================================== */

function setupAdminDropdownToggle() {
    const adminTab = document.getElementById('admin-tab');

    if (!adminTab) {
        return;
    }

    const toggleBtn = adminTab.querySelector(
        '.admin-tab-toggle'
    );

    if (!toggleBtn) {
        return;
    }

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


/* ==========================================================================
   Add Place Navigation
   ========================================================================== */

/**
 * Shows the Add Place link for authenticated users.
 */
function setupAddPlaceNav(token) {
    const addPlaceLink = document.getElementById(
        'add-place-link'
    );

    if (!addPlaceLink) {
        return;
    }

    addPlaceLink.style.display = token
        ? 'inline-block'
        : 'none';
}


/* ==========================================================================
   Login / Logout
   ========================================================================== */

function handleLogout(event) {
    event.preventDefault();

    document.cookie =
        'token=; path=/; max-age=0';

    window.location.href = 'home.html';
}


/**
 * Toggles Login vs Logout based on authentication state.
 */
function setupAuthLinks(token) {
    const loginLink = document.getElementById(
        'login-link'
    );

    const logoutLink = document.getElementById(
        'logout-link'
    );

    if (loginLink) {
        loginLink.style.display = token
            ? 'none'
            : 'block';
    }

    if (logoutLink) {
        logoutLink.style.display = token
            ? 'block'
            : 'none';
    }
}


/* ==========================================================================
   Navigation State
   ========================================================================== */

function refreshNavState() {
    const token = getCookie('token');

    setupAuthLinks(token);
    setupAdminNav(token);
    setupAddPlaceNav(token);
    applyAdminOnlyVisibility();
}


/* ==========================================================================
   Page Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    refreshNavState();

    setupAdminDropdownToggle();

    const logoutLink = document.getElementById(
        'logout-link'
    );

    if (logoutLink) {
        logoutLink.addEventListener(
            'click',
            handleLogout
        );
    }
});


/* ==========================================================================
   Browser Back / Forward Cache
   ========================================================================== */

/**
 * Browsers can restore pages from the back/forward cache without
 * firing DOMContentLoaded again. Re-check authentication state when
 * the page is restored.
 */
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        refreshNavState();
    }
});