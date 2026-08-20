document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('review-form')) {
        setupReviewForm();
    }
});

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
    setupStarRating();

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

async function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('rating');
    if (!stars.length || !ratingInput) return;

    const paintStars = (value) => {
        stars.forEach((star) => {
            const starValue = parseInt(star.dataset.value, 10);
            star.classList.toggle('filled', starValue <= value);
            star.setAttribute('aria-pressed', starValue <= value ? 'true' : 'false');
        });
    };

    stars.forEach((star) => {
        const value = parseInt(star.dataset.value, 10);

        star.addEventListener('click', () => {
            ratingInput.value = value;
            paintStars(value);
        });

        star.addEventListener('mouseenter', () => {
            paintStars(value);
        });
    });

    const starRating = document.querySelector('.star-rating');
    starRating.addEventListener('mouseleave', () => {
        paintStars(parseInt(ratingInput.value, 10) || 0);
    });
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