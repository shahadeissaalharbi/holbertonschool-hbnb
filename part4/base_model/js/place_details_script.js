document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('place-details')) {
        const placeId = getPlaceIdFromURL();
        checkPlaceAuthentication(placeId);
    }
});

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
            const img = document.createElement('img');
            
            const rawName = (typeof amenity === 'string' ? amenity : amenity.name) || '';
            const cleanName = rawName.toLowerCase().trim();

            if (cleanName.includes('air conditioning') || cleanName.includes('ac')) {
                img.src = 'images/icon_bed.png';
            } else if (cleanName.includes('swimming pool') || cleanName.includes('pool')) {
                img.src = 'images/icon_bath.png';
            } else if (amenity.icon) {
                img.src = amenity.icon;
            } else {
                const formattedName = cleanName.replace(/\s+/g, '_');
                img.src = `images/icon_${formattedName}.png`;
            }

            img.alt = rawName;

            img.onerror = () => { 
                img.src = 'images/icon_bath.png'; 
            };

            const span = document.createElement('span');
            span.textContent = rawName;

            li.appendChild(img);
            li.appendChild(span);
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