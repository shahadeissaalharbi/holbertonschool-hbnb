document.addEventListener('DOMContentLoaded', () => {
    checkLoginAndSetupForm();
});

function checkLoginAndSetupForm() {
    const token = getCookie('token');
    const formContainer = document.getElementById('add-place-form');
    const accessMessage = document.getElementById('access-message');

    if (!token) {
        if (formContainer) formContainer.style.display = 'none';
        if (accessMessage) {
            accessMessage.textContent = 'Please log in to add a place.';
            accessMessage.style.display = 'block';
        }
        return;
    }

    if (formContainer) formContainer.style.display = 'flex';
    loadAmenities();
    setupAddPlaceForm(token);
}


async function loadAmenities() {
    const group = document.getElementById('amenities-group');
    const list = document.getElementById('amenities-list');
    if (!group || !list) return;

    try {
        const response = await fetch(`${API_URL}/amenities/`);
        if (!response.ok) return;

        const amenities = await response.json();
        if (!Array.isArray(amenities) || amenities.length === 0) return;

        list.innerHTML = amenities.map((a) => `
            <label class="amenity-option">
                <input type="checkbox" name="amenities" value="${a.id}">
                ${a.name}
            </label>
        `).join('');

        group.style.display = 'block';
    } catch (error) {
        // Amenities are optional 
    }
}

function setupAddPlaceForm(token) {
    const form = document.getElementById('add-place-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('place-title').value.trim();
        const description = document.getElementById('place-description').value.trim();
        const price = parseFloat(document.getElementById('place-price').value);
        const latitude = parseFloat(document.getElementById('place-latitude').value);
        const longitude = parseFloat(document.getElementById('place-longitude').value);
        const amenities = Array.from(
            document.querySelectorAll('input[name="amenities"]:checked')
        ).map((el) => el.value);

        const image_url = document.getElementById('place-image-url').value.trim();
        // Textarea holds one URL per line; stored as a single
        // comma-separated string to match how the API returns
        // `images` (place.images.split(',')).
        const images = document.getElementById('place-images').value
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
            .join(',');

        await submitNewPlace(token, { title, description, price, latitude, longitude, amenities, image_url, images });
    });
}

async function submitNewPlace(token, placeData) {
    try {
        const response = await fetch(`${API_URL}/places/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(placeData)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            displayAddPlaceMessage(
                'Place created! Redirecting...',
                'success'
            );

            window.location.href = `place.html?id=${data.id}`;

        } else if (response.status === 401) {
            displayAddPlaceMessage(
                'Your session has expired. Redirecting to login...',
                'error'
            );

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } else {
            displayAddPlaceMessage(
                data.error || data.msg || 'Failed to create place.',
                'error'
            );
        }

    } catch (error) {
        displayAddPlaceMessage(
            'Could not reach the server. Please try again.',
            'error'
        );
    }
}

function displayAddPlaceMessage(message, type) {
    let messageEl = document.getElementById('add-place-message');
    if (!messageEl) {
        messageEl = document.createElement('p');
        messageEl.id = 'add-place-message';
        document.querySelector('.submit-button').insertAdjacentElement('afterend', messageEl);
    }
    messageEl.textContent = message;
    messageEl.className = type === 'success' ? 'register-message success' : 'register-message error';
}