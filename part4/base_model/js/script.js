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