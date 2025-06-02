// ShoreSquad main application JavaScript

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

async function initApp() {
    // Initialize all major components
    initializeMap();
    initializeWeather();
    initializeAnimations();
}

// Cleanup locations data
const cleanupLocations = {
    'pasir-ris': {
        name: 'Pasir Ris Beach',
        date: 'June 15, 2025',
        time: '8:00 AM - 11:00 AM',
        coordinates: '1.381497,103.955574',
        participants: '24/50'
    },
    'east-coast': {
        name: 'East Coast Park',
        date: 'June 22, 2025',
        time: '8:00 AM - 11:00 AM',
        coordinates: '1.300807,103.907674',
        participants: '18/50'
    },
    'punggol': {
        name: 'Punggol Beach',
        date: 'June 29, 2025',
        time: '8:00 AM - 11:00 AM',
        coordinates: '1.423890,103.906337',
        participants: '12/50'
    },
    'changi': {
        name: 'Changi Beach',
        date: 'July 6, 2025',
        time: '8:00 AM - 11:00 AM',
        coordinates: '1.391433,103.991562',
        participants: '8/50'
    }
};

// Map Initialization
function initializeMap() {
    const locationSelect = document.getElementById('cleanup-location');
    const cleanupDetails = document.getElementById('cleanup-details');
    const mapContainer = document.getElementById('cleanup-map');

    // Update location details and map when selection changes
    locationSelect.addEventListener('change', (e) => {
        const location = cleanupLocations[e.target.value];
        updateCleanupDetails(location);
        updateMap(location);
    });

    // Initialize with default location (Pasir Ris)
    updateCleanupDetails(cleanupLocations['pasir-ris']);
    updateMap(cleanupLocations['pasir-ris']);
}

// Update cleanup details in the info box
function updateCleanupDetails(location) {
    const cleanupDetails = document.getElementById('cleanup-details');
    cleanupDetails.innerHTML = `
        <h3><i class="fas fa-map-marker-alt"></i> Next Cleanup: ${location.name}</h3>
        <p><i class="far fa-calendar"></i> Date: ${location.date}</p>
        <p><i class="far fa-clock"></i> Time: ${location.time}</p>
        <p><i class="fas fa-users"></i> Participants: ${location.participants}</p>
        <button class="primary-btn join-cleanup-btn" onclick="joinCleanup('${location.name}', '${location.coordinates}')">Join This Cleanup</button>
    `;

    // Add confirmation message div if it doesn't exist
    if (!document.getElementById('join-confirmation')) {
        const confirmationDiv = document.createElement('div');
        confirmationDiv.id = 'join-confirmation';
        confirmationDiv.className = 'join-confirmation';
        cleanupDetails.appendChild(confirmationDiv);
    }
}

// Join cleanup functionality
function joinCleanup(locationName, coordinates) {
    // Update the map to focus on the location with animation
    updateMap({
        name: locationName,
        coordinates: coordinates
    }, true);

    // Show confirmation message
    const confirmationDiv = document.getElementById('join-confirmation');
    confirmationDiv.innerHTML = `
        <div class="confirmation-content">
            <i class="fas fa-check-circle"></i>
            <p>You've joined the cleanup at ${locationName}!</p>
            <p class="confirmation-details">Meet at the pinned location</p>
        </div>
    `;
    confirmationDiv.style.display = 'block';
    confirmationDiv.classList.add('show');

    // Update participant count
    updateParticipantCount(locationName);
}

// Update participant count when someone joins
function updateParticipantCount(locationName) {
    const locationKey = Object.keys(cleanupLocations).find(
        key => cleanupLocations[key].name === locationName
    );
    
    if (locationKey) {
        const [current, max] = cleanupLocations[locationKey].participants.split('/');
        const newCount = Math.min(parseInt(current) + 1, parseInt(max));
        cleanupLocations[locationKey].participants = `${newCount}/${max}`;
        
        // Update the display
        const cleanupDetails = document.getElementById('cleanup-details');
        const participantsEl = cleanupDetails.querySelector('.fas.fa-users').parentNode;
        participantsEl.innerHTML = `<i class="fas fa-users"></i> Participants: ${newCount}/${max}`;
    }
}

// Update map with new location
function updateMap(location, isJoining = false) {
    const mapContainer = document.getElementById('cleanup-map');
    const [lat, lng] = location.coordinates.split(',');
    
    // Use a higher zoom level when joining
    const zoomLevel = isJoining ? '17' : '15';
    
    mapContainer.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            style="border:0"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6345903843265!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${zoomLevel}!3m3!1m2!1s0x0%3A0x0!2zMcKwMjInNTMuNCJOIDEwM8KwNTcnMjAuMSJF!5e0!3m2!1sen!2s!4v1685750400000!5m2!1sen!2s">
        </iframe>
    `;

    // Add smooth scroll to map when joining
    if (isJoining) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Weather Information
async function initializeWeather() {
    const weatherLocation = document.getElementById('weather-location');
    weatherLocation.addEventListener('change', () => fetchWeatherData(weatherLocation.value));
    
    // Initial weather fetch
    await fetchWeatherData('pasir-ris');
}

async function fetchWeatherData(location) {
    const weatherForecast = document.getElementById('weather-forecast');
    weatherForecast.innerHTML = `
        <div class="loading-weather">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading weather data...</p>
        </div>
    `;

    try {
        // Fetch 4-day forecast from data.gov.sg
        const response = await fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast');
        const data = await response.json();
        
        if (data.items && data.items[0].forecasts) {
            const forecasts = data.items[0].forecasts;
            displayWeatherForecasts(forecasts, location);
        } else {
            throw new Error('Invalid forecast data');
        }
    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherForecast.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load weather data. Please try again later.</p>
            </div>
        `;
    }
}

function displayWeatherForecasts(forecasts, location) {
    const weatherForecast = document.getElementById('weather-forecast');
    const locationName = document.getElementById('weather-location')
        .options[document.getElementById('weather-location').selectedIndex].text;

    let weatherHTML = '';

    forecasts.forEach(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });

        const weatherIcon = getWeatherIcon(day.forecast.toLowerCase());
        
        weatherHTML += `
            <div class="weather-card">
                <div class="date">${formattedDate}</div>
                ${weatherIcon}
                <div class="temp">${day.temperature.high}°C</div>
                <div class="forecast">${day.forecast}</div>
                <div class="rain-chance">Relative Humidity: ${day.relative_humidity.high}%</div>
            </div>
        `;
    });

    weatherForecast.innerHTML = weatherHTML;
}

function getWeatherIcon(forecast) {
    const iconMap = {
        'cloudy': 'fa-cloud',
        'sunny': 'fa-sun',
        'partly cloudy': 'fa-cloud-sun',
        'rain': 'fa-cloud-rain',
        'showers': 'fa-cloud-showers-heavy',
        'thunderstorm': 'fa-bolt',
        'fair': 'fa-sun',
        'fair & warm': 'fa-sun',
        'windy': 'fa-wind'
    };

    const defaultIcon = 'fa-cloud';
    let iconClass = defaultIcon;

    // Find the matching icon or partial match
    for (const [condition, icon] of Object.entries(iconMap)) {
        if (forecast.includes(condition)) {
            iconClass = icon;
            break;
        }
    }

    return `<i class="fas ${iconClass}"></i>`;
}

// Smooth Scrolling for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation and Interactive Elements
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Observe all stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });

    // Initialize counter animations for statistics
    animateStatistics();
}

// Animate Statistics
function animateStatistics() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        animateValue(stat, 0, target, 2000);
    });
}

// Counter Animation Helper
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Performance Optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Responsive Navigation
function toggleMobileMenu() {
    // TODO: Implement mobile menu functionality
}

// Error Handling
function handleError(error) {
    console.error('An error occurred:', error);
    // TODO: Implement user-friendly error messaging
}
