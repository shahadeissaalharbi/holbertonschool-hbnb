// register_script.js
// Handles the "Add User" form on register.html.
// Only accessible to an authenticated admin (enforced both client-side
// for UX and server-side via JWT + is_admin check on POST /users/).

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccessAndSetupForm();
});

/**
 * Verifies the current user is an authenticated admin before
 * revealing the form. Non-admin or unauthenticated visitors
 * see an explanatory message instead of a broken form.
 */
function checkAdminAccessAndSetupForm() {
    const token = getCookie('token');
    const formContainer = document.getElementById('register-form');
    const accessMessage = document.getElementById('access-message');

    if (!token || !isAdminUser(token)) {
        if (formContainer) formContainer.style.display = 'none';
        if (accessMessage) {
            accessMessage.textContent = 'Only an administrator can add a new user. Please log in with an admin account.';
            accessMessage.style.display = 'block';
        }
        return;
    }

    if (formContainer) formContainer.style.display = 'flex';
    setupRegisterForm(token);
}


function isAdminUser(token) {
    try {
        const base64Payload = token.split('.')[1];
        const decoded = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.is_admin === true;
    } catch (error) {
        return false;
    }
}

/**
 * Wires up the submit handler for the add-user form.
 */
function setupRegisterForm(token) {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const first_name = document.getElementById('first-name').value.trim();
        const last_name = document.getElementById('last-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            displayRegisterMessage('Passwords do not match', 'error');
            return;
        }

        await submitNewUser(token, { first_name, last_name, email, password });
    });
}

/**
 * Sends the new user data to the API with the admin's token attached.
 */
async function submitNewUser(token, userData) {
    try {
        const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            displayRegisterMessage('User created successfully! Redirecting to login...', 'success');
            document.getElementById('register-form').reset();

            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else if (response.status === 401) {
            displayRegisterMessage('Your session has expired. Redirecting to login...', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            displayRegisterMessage(data.error || data.msg || 'Failed to create user.', 'error');
        }
    } catch (error) {
        displayRegisterMessage('Could not reach the server. Please try again.', 'error');
    }
}

/**
 * Displays a success or error message below the submit button.
 */
function displayRegisterMessage(message, type) {
    let messageEl = document.getElementById('register-message');
    if (!messageEl) {
        messageEl = document.createElement('p');
        messageEl.id = 'register-message';
        document.querySelector('.submit-button').insertAdjacentElement('afterend', messageEl);
    }
    messageEl.textContent = message;
    messageEl.className = type === 'success' ? 'register-message success' : 'register-message error';
}
