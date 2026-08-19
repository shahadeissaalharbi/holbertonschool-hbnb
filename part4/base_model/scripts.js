const API_URL = 'http://127.0.0.1:5000/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');
    if (loginLink) {
        loginLink.style.display = token ? 'none' : 'block';
    }

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

    if (document.getElementById('review-form')) {
        setupReviewForm();
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
            document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
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
        const submitBtn = document.querySelector('.submit-button');
        if (submitBtn) {
            submitBtn.insertAdjacentElement('afterend', errorEl);
        }
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

        if (place.image_url) {
            placeCard.style.backgroundImage = `url('${place.image_url}')`;
        }

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
    return params.get('id') || params.get('place_id');
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

        
        const [placeResponse, reviewsResponse] = await Promise.all([
            fetch(`${API_URL}/places/${placeId}`, { method: 'GET', headers }),
            fetch(`${API_URL}/places/${placeId}/reviews`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        ]);

        if (!placeResponse.ok) {
            console.error('Failed to fetch place details:', placeResponse.status);
            return;
        }

        const place = await placeResponse.json();
        const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];

        displayPlaceDetails(place, reviews, token);
    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

function displayPlaceDetails(place, reviews, token) {
    const nameEl = document.getElementById('place-name');
    if (nameEl) nameEl.textContent = place.title;

    const placeInfo = document.getElementById('place-info');
    if (placeInfo) {
        placeInfo.innerHTML = '';

        // Image gallery
        if (place.images && place.images.length > 0) {
            const gallery = document.createElement('div');
            gallery.className = 'place-gallery';
            place.images.forEach((url) => {
                const img = document.createElement('img');
                img.src = url.trim();
                img.alt = place.title;
                img.className = 'gallery-image';
                gallery.appendChild(img);
            });
            placeInfo.appendChild(gallery);
        }

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

    displayReviews(reviews || [], token);
}

function displayReviews(reviews, token) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        const noReviews = document.createElement('p');
        noReviews.textContent = 'No reviews yet.';
        reviewsList.appendChild(noReviews);
        return;
    }

    const currentUserId = token ? getUserIdFromToken(token) : null;

    reviews.forEach((review) => {
        const card = document.createElement('article');
        card.className = 'review-card';

        // The reviews-list endpoint only returns id/text/rating/user_id
        // right now, so there's no reviewer name to show without a
        // further backend change.
        card.innerHTML = `
            <div class="review-body">
                <p class="review-user">${review.user && review.user.first_name ? review.user.first_name : 'Anonymous'}</p>
                <p class="review-comment">${review.text}</p>
                <p class="review-rating" aria-label="Rating: ${review.rating} out of 5">${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}</p>
            </div>
        `;

        
        if (currentUserId && review.user_id === currentUserId) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-review-button';
            deleteBtn.type = 'button';
            deleteBtn.setAttribute('aria-label', 'Delete review');
            deleteBtn.innerHTML = '<img src="images/icon_trash.png" alt="" class="trash-icon">';
            deleteBtn.addEventListener('click', () => {
                deleteReview(review.id, token, card);
            });
            card.querySelector('.review-body').appendChild(deleteBtn);
        }

        reviewsList.appendChild(card);
    });
}

async function deleteReview(reviewId, token, cardElement) {
    const confirmed = window.confirm('Delete this review? This cannot be undone.');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            cardElement.remove();
        } else {
            let message = 'Failed to delete review, please try again';
            try {
                const data = await response.json();
                if (data && data.error) {
                    message = data.error;
                } else if (data && data.message) {
                    message = data.message;
                }
            } catch (e) {
                // response body wasn't JSON — keep the default message
            }
            alert(message);
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('A connection error occurred, please try again');
    }
}

function getUserIdFromToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.sub || payload.id || payload.user_id;
    } catch (e) {
        return null;
    }
}


// ---- Add Review Page ----

function setupReviewForm() {
    const token = getCookie('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const placeId = getPlaceIdFromURL();
    const reviewForm = document.getElementById('review-form');

    if (!placeId) {
        displayReviewMessage('Place ID is missing from the URL', 'error');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        return;
    }

    displayReviewingPlaceName(placeId);

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const reviewInput = document.getElementById('review');
            const ratingInput = document.getElementById('rating');

            const reviewText = reviewInput ? reviewInput.value.trim() : '';
            const rating = ratingInput ? parseInt(ratingInput.value, 10) : null;

            if (!reviewText) {
                displayReviewMessage('You must write review text before submitting', 'error');
                return;
            }

            if (!rating) {
                displayReviewMessage('Please select a rating', 'error');
                return;
            }

            await submitReview(token, placeId, reviewText, rating);
        });
    }
}

async function displayReviewingPlaceName(placeId) {
    const heading = document.getElementById('reviewing-place-name');
    if (!heading) return;

    try {
        const response = await fetch(`${API_URL}/places/${placeId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const place = await response.json();
            heading.textContent = `Reviewing: ${place.title}`;
        } else {
            heading.textContent = 'Reviewing: this place';
        }
    } catch (error) {
        console.error('Error fetching place name:', error);
        heading.textContent = 'Reviewing: this place';
    }
}

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`${API_URL}/reviews/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: reviewText,
                rating: rating,
                place_id: placeId
            })
        });

        await handleReviewResponse(response, placeId);
    } catch (error) {
        console.error('Error submitting review:', error);
        displayReviewMessage('A connection error occurred, please try again', 'error');
    }
}

async function handleReviewResponse(response, placeId) {
    const form = document.getElementById('review-form');
    if (response.ok) {
        if (form) form.reset();
        
        sessionStorage.setItem('reviewSubmittedMessage', 'Review submitted successfully!');
        window.location.href = `place.html?id=${placeId}`;
    } else {
        let message = 'Failed to submit review, please try again';
        try {
            const data = await response.json();
            if (data && data.error) {
                message = data.error;
            } else if (data && data.message) {
                message = data.message;
            }
        } catch (e) {
            // response body wasn't JSON — keep the default message
        }
        displayReviewMessage(message, 'error');
    }
}
function displayReviewMessage(message, type) {
    let messageEl = document.getElementById('review-message');
    if (!messageEl) {
        messageEl = document.createElement('p');
        messageEl.id = 'review-message';
        messageEl.style.marginTop = '10px';
        messageEl.style.textAlign = 'center';
        const submitBtn = document.querySelector('#review-form .submit-button');
        if (submitBtn) {
            submitBtn.insertAdjacentElement('afterend', messageEl);
        } else {
            const reviewForm = document.getElementById('review-form');
            if (reviewForm) reviewForm.appendChild(messageEl);
        }
    }
    messageEl.style.color = type === 'success' ? 'green' : 'red';
    messageEl.textContent = message;
}