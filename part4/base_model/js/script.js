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
});