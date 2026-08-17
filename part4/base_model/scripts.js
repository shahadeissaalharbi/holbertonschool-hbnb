const API_URL = 'http://127.0.0.1:5000/api/v1';

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

    if (document.getElementById('places-list')) {
        checkAuthentication();
    }

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            filterPlacesByPrice(event.target.value);
        });
    }

    if (document.getElementById('place-details')) {
        const placeId = getPlaceIdFromURL();
        checkPlaceAuthentication(placeId);
    }
});

// --Login--
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            window.location.href = 'index.html';
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
        document.querySelector('.submit-button').insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = message;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');

    if (!token) {
        if (loginLink) loginLink.style.display = 'block';
        fetchPlaces(null);
    } else {
        if (loginLink) loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

async function fetchPlaces(token) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/places/`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        } else {
            console.error('Failed to fetch places:', response.status);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    if (!placesList) return;

    placesList.innerHTML = '';

    places.forEach((place) => {
        const placeCard = document.createElement('article');
        placeCard.className = 'place-card';
        placeCard.dataset.price = place.price;

        placeCard.innerHTML = `
            <h2>${place.title}</h2>
            <p class="place-price">Price per night: $${place.price}</p>
            <a href="place.html?id=${place.id}" class="details-button">View Details</a>
        `;

        placesList.appendChild(placeCard);
    });
}

function filterPlacesByPrice(maxPrice) {
    const placeCards = document.querySelectorAll('.place-card');
    placeCards.forEach((card) => {
        const price = parseFloat(card.dataset.price);
        if (maxPrice === 'all' || price <= parseFloat(maxPrice)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ---- Place Details Page ----

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function checkPlaceAuthentication(placeId) {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        if (loginLink) loginLink.style.display = 'block';
        if (addReviewSection) addReviewSection.style.display = 'none';
    } else {
        if (loginLink) loginLink.style.display = 'none';
        if (addReviewSection) addReviewSection.style.display = 'block';

        const addReviewLink = document.getElementById('add-review-link');
        if (addReviewLink) addReviewLink.href = `add_review.html?id=${placeId}`;
    }

    fetchPlaceDetails(token, placeId);
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/places/${placeId}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            console.error('Failed to fetch place details:', response.status);
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

function displayPlaceDetails(place) {
    const nameEl = document.getElementById('place-name');
    if (nameEl) nameEl.textContent = place.title;

    const placeInfo = document.getElementById('place-info');
    if (placeInfo) {
        placeInfo.innerHTML = '';

        const hostEl = document.createElement('p');
        hostEl.innerHTML = `<span class="host-name">Host:</span> ${place.owner ? place.owner.first_name + ' ' + place.owner.last_name : 'Unknown'}`;
        placeInfo.appendChild(hostEl);

        const priceEl = document.createElement('p');
        priceEl.innerHTML = `<span class="place-price-value">Price per night:</span> $${place.price}`;
        placeInfo.appendChild(priceEl);

        const descEl = document.createElement('p');
        descEl.innerHTML = `<strong>Description:</strong> ${place.description}`;
        placeInfo.appendChild(descEl);

        const amenitiesWrap = document.createElement('div');
        const amenitiesLabel = document.createElement('strong');
        amenitiesLabel.textContent = 'Amenities:';
        amenitiesWrap.appendChild(amenitiesLabel);

        const amenitiesList = document.createElement('ul');
        amenitiesList.className = 'amenities-list';
        (place.amenities || []).forEach((amenity) => {
            const li = document.createElement('li');
            li.textContent = amenity.name;
            amenitiesList.appendChild(li);
        });
        amenitiesWrap.appendChild(amenitiesList);
        placeInfo.appendChild(amenitiesWrap);
    }

    displayReviews(place.reviews || []);
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        const noReviews = document.createElement('p');
        noReviews.textContent = 'No reviews yet.';
        reviewsList.appendChild(noReviews);
        return;
    }

    reviews.forEach((review) => {
        const card = document.createElement('article');
        card.className = 'review-card';

        card.innerHTML = `
            <div class="review-body">
                <p class="review-user">${review.user ? review.user.first_name : 'Anonymous'}</p>
                <p class="review-comment">${review.text}</p>
                <p class="review-rating" aria-label="Rating: ${review.rating} out of 5">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
            </div>
        `;

        reviewsList.appendChild(card);
    });
}