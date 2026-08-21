// Requires script.js to be loaded first (API_URL, getCookie).

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    }
});

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
            window.location.href = 'home.html';
        } else {
            const errorData = await response.json().catch(() => ({}));
            displayLoginError(errorData.message || 'Invalid email or password');
        }
    } catch (error) {
        displayLoginError('Could not reach the server. Please try again.');
    }
}

function displayLoginError(message) {
    let errorEl = document.getElementById('login-error');
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'login-error';
        errorEl.style.color = 'red';
        errorEl.style.marginTop = '10px';
        errorEl.style.textAlign = 'center';
        const submitBtn = document.querySelector('.submit-button');
        if (submitBtn) {
            submitBtn.insertAdjacentElement('afterend', errorEl);
        }
    }
    errorEl.textContent = message;
}