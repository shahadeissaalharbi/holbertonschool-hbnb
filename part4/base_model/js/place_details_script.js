/* ==========================================================================
   HBnB - Place details page (place.html)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Place page loaded');
    console.log('Current URL:', window.location.href);

    const placeId = getPlaceIdFromURL();

    console.log('Place ID:', placeId);

    if (!placeId) {
        console.error('No place ID found in URL');
        return;
    }

    if (document.getElementById('place-details')) {
        checkPlaceAuthentication(placeId);
    }
});


/* ==========================================================================
   Get Place ID
   ========================================================================== */

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}


/* ==========================================================================
   Authentication
   ========================================================================== */

function checkPlaceAuthentication(placeId) {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        if (loginLink) {
            loginLink.style.display = 'block';
        }

        if (addReviewSection) {
            addReviewSection.style.display = 'none';
        }
    } else {
        if (loginLink) {
            loginLink.style.display = 'none';
        }

        if (addReviewSection) {
            addReviewSection.style.display = 'block';
        }

        const addReviewLink = document.getElementById('add-review-link');

        if (addReviewLink) {
            addReviewLink.href = `add_review.html?id=${placeId}`;
        }
    }

    fetchPlaceDetails(token, placeId);
}


/* ==========================================================================
   Fetch Place Details and Reviews
   ========================================================================== */

async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const [placeResponse, reviewsResponse] = await Promise.all([
            fetch(`${API_URL}/places/${placeId}`, {
                method: 'GET',
                headers
            }),

            fetch(`${API_URL}/places/${placeId}/reviews`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        ]);

        if (!placeResponse.ok) {
            console.error(
                'Failed to fetch place details:',
                placeResponse.status
            );
            return;
        }

        const place = await placeResponse.json();

        const reviews = reviewsResponse.ok
            ? await reviewsResponse.json()
            : [];

        displayPlaceDetails(place, reviews, token);

    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}


/* ==========================================================================
   Display Place Details
   ========================================================================== */

function displayPlaceDetails(place, reviews, token) {
    const nameEl = document.getElementById('place-name');

    if (nameEl) {
        nameEl.textContent = place.title;
    }

    const placeInfo = document.getElementById('place-info');

    if (placeInfo) {
        placeInfo.innerHTML = '';

        /* ------------------------------------------------------------------
           Image Gallery
           ------------------------------------------------------------------ */

        if (place.images && place.images.length > 0) {
            const gallery = document.createElement('div');
            gallery.className = 'place-gallery';

            place.images.forEach((url) => {
                const img = document.createElement('img');

                img.src = url.trim();
                img.alt = place.title || 'Place image';
                img.className = 'gallery-image';

                gallery.appendChild(img);
            });

            placeInfo.appendChild(gallery);
        }


        /* ------------------------------------------------------------------
           Host
           ------------------------------------------------------------------ */

        const hostEl = document.createElement('p');

        const hostName = place.owner
            ? `${place.owner.first_name || ''} ${place.owner.last_name || ''}`.trim()
            : 'Unknown';

        hostEl.innerHTML = `
            <span class="host-name">Host:</span> ${hostName}
        `;

        placeInfo.appendChild(hostEl);


        /* ------------------------------------------------------------------
           Price
           ------------------------------------------------------------------ */

        const priceEl = document.createElement('p');

        priceEl.innerHTML = `
            <span class="place-price-value">Price per night:</span>
            $${place.price}
        `;

        placeInfo.appendChild(priceEl);


        /* ------------------------------------------------------------------
           Description
           ------------------------------------------------------------------ */

        const descEl = document.createElement('p');

        descEl.innerHTML = `
            <strong>Description:</strong> ${place.description || 'No description available.'}
        `;

        placeInfo.appendChild(descEl);


        /* ------------------------------------------------------------------
           Amenities
           ------------------------------------------------------------------ */

        const amenitiesWrap = document.createElement('div');

        const amenitiesLabel = document.createElement('strong');
        amenitiesLabel.textContent = 'Amenities:';

        amenitiesWrap.appendChild(amenitiesLabel);

        const amenitiesList = document.createElement('ul');
        amenitiesList.className = 'amenities-list';

        (place.amenities || []).forEach((amenity) => {
            const li = document.createElement('li');
            const img = document.createElement('img');

            const rawName =
                (typeof amenity === 'string'
                    ? amenity
                    : amenity.name) || '';

            const cleanName = rawName.toLowerCase().trim();

            /*
             * Select an icon based on the amenity name.
             */

            if (
                cleanName.includes('air conditioning') ||
                cleanName.includes('ac')
            ) {
                img.src = 'images/icon_bed.png';

            } else if (
                cleanName.includes('swimming pool') ||
                cleanName.includes('pool')
            ) {
                img.src = 'images/icon_bath.png';

            } else if (
                typeof amenity === 'object' &&
                amenity.icon
            ) {
                img.src = amenity.icon;

            } else {
                const formattedName = cleanName.replace(/\s+/g, '_');

                img.src = `images/icon_${formattedName}.png`;
            }

            img.alt = rawName;

            /*
             * Use a fallback icon if the requested icon doesn't exist.
             */

            img.onerror = () => {
                img.onerror = null;
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


/* ==========================================================================
   Display Reviews
   ========================================================================== */

function displayReviews(reviews, token) {
    const reviewsList = document.getElementById('reviews-list');

    if (!reviewsList) {
        return;
    }

    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        const noReviews = document.createElement('p');

        noReviews.className = 'no-reviews';
        noReviews.textContent = 'No reviews yet.';

        reviewsList.appendChild(noReviews);

        return;
    }

    const currentUserId = token
        ? getUserIdFromToken(token)
        : null;

    reviews.forEach((review) => {
        const card = document.createElement('article');

        card.className = 'review-card';

        /*
         * Some API responses may include review.user while others
         * may only provide user_id.
         */

        const reviewerName =
            review.user && review.user.first_name
                ? review.user.first_name
                : 'Anonymous';

        const rating = Number(review.rating) || 0;

        const safeRating = Math.max(
            0,
            Math.min(5, rating)
        );

        card.innerHTML = `
            <div class="review-body">
                <p class="review-user">${reviewerName}</p>

                <p class="review-comment">
                    ${review.text || ''}
                </p>

                <p
                    class="review-rating"
                    aria-label="Rating: ${safeRating} out of 5"
                >
                    ${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}
                </p>
            </div>
        `;


        /* ------------------------------------------------------------------
           Delete Button
           ------------------------------------------------------------------ */

        if (
            currentUserId &&
            String(review.user_id) === String(currentUserId)
        ) {
            const deleteBtn = document.createElement('button');

            deleteBtn.className = 'delete-review-button';
            deleteBtn.type = 'button';
            deleteBtn.setAttribute(
                'aria-label',
                'Delete review'
            );

            deleteBtn.innerHTML = `
                <img
                    src="images/icon_trash.png"
                    alt=""
                    class="trash-icon"
                >
            `;

            deleteBtn.addEventListener('click', () => {
                deleteReview(
                    review.id,
                    token,
                    card
                );
            });

            const reviewBody = card.querySelector('.review-body');

            if (reviewBody) {
                reviewBody.appendChild(deleteBtn);
            }
        }

        reviewsList.appendChild(card);
    });
}


/* ==========================================================================
   Delete Review
   ========================================================================== */

async function deleteReview(reviewId, token, cardElement) {
    const confirmed = window.confirm(
        'Delete this review? This cannot be undone.'
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/reviews/${reviewId}`,
            {
                method: 'DELETE',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.ok) {
            cardElement.remove();
        } else {
            let message =
                'Failed to delete review, please try again';

            try {
                const data = await response.json();

                if (data && data.error) {
                    message = data.error;
                } else if (data && data.message) {
                    message = data.message;
                }

            } catch (e) {
                /*
                 * Response body wasn't JSON.
                 * Keep the default error message.
                 */
            }

            alert(message);
        }

    } catch (error) {
        console.error(
            'Error deleting review:',
            error
        );

        alert(
            'A connection error occurred, please try again'
        );
    }
}


/* ==========================================================================
   Get User ID From JWT Token
   ========================================================================== */

function getUserIdFromToken(token) {
    try {
        const parts = token.split('.');

        if (parts.length < 2) {
            return null;
        }

        const base64Url = parts[1];

        const base64 = base64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return (
                        '%' +
                        ('00' + c.charCodeAt(0).toString(16))
                            .slice(-2)
                    );
                })
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        return (
            payload.sub ||
            payload.id ||
            payload.user_id
        );

    } catch (e) {
        return null;
    }
}