document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('event-form');
    const eventsContainer = document.getElementById('events-container');
    const API_URL = '/api'; // Using relative URL since frontend is served from same origin

    // Fetch and display all events on page load
    const fetchAllEvents = async () => {
        try {
            const response = await fetch(`${API_URL}/events`);
            if (!response.ok) throw new Error('Failed to fetch events.');

            const events = await response.json();
            eventsContainer.innerHTML = ''; // Clear existing events
            if (events.length === 0) {
                eventsContainer.innerHTML = '<p>No events planned yet. Add one above!</p>';
                return;
            }
            events.forEach(event => displayEvent(event));
        } catch (error) {
            eventsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    };

    // Display a single event card and fetch its weather
    const displayEvent = async (event) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <h3>${event.name}</h3>
            <div class="event-details">
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Type:</strong> ${event.eventType}</p>
            </div>
            <div class="weather-details" id="weather-${event.id}">
                <p>Checking weather...</p>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
        fetchWeatherForEvent(event.id);
    };

    // Fetch and display weather suitability for an event
    const fetchWeatherForEvent = async (eventId) => {
        const weatherContainer = document.getElementById(`weather-${eventId}`);
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/suitability`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Weather data not available.');
            }

            const data = await response.json();
            const { weather, suitability } = data;
            const score = suitability.score;

            let scoreClass = 'na';
            if (score > 70) scoreClass = 'good';
            else if (score > 40) scoreClass = 'okay';
            else if (score > 0) scoreClass = 'poor';

            weatherContainer.innerHTML = `
                <div class="weather-info">
                    <span>${weather.temp.toFixed(1)}°C, ${weather.condition}</span>
                    <span class="suitability-score ${scoreClass}">Score: ${score}</span>
                </div>
                <p class="alternatives" onclick="fetchAlternatives('${eventId}')">Find better dates</p>
            `;
        } catch (error) {
            weatherContainer.innerHTML = `<p style="color: #e74c3c;">${error.message}</p>`;
        }
    };

    // Fetch and alert alternative dates
    window.fetchAlternatives = async (eventId) => {
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/alternatives`);
            const data = await response.json();

            if (data.alternatives && data.alternatives.length > 0) {
                let alertMessage = `${data.message}\n\n`;
                data.alternatives.slice(0, 3).forEach(alt => { // Show top 3
                    alertMessage += `- ${new Date(alt.date).toLocaleDateString()}: Score ${alt.score} (${alt.weather.temp}, ${alt.weather.condition})\n`;
                });
                alert(alertMessage);
            } else {
                alert("No better weather days found in the current forecast.");
            }
        } catch (error) {
            alert('Could not fetch alternative dates.');
        }
    };

    // Handle the form submission to create a new event
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEvent = {
            name: document.getElementById('name').value,
            location: document.getElementById('location').value,
            date: document.getElementById('date').value,
            eventType: document.getElementById('eventType').value,
        };

        try {
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create event.');
            }

            eventForm.reset();
            fetchAllEvents(); // Refresh the list
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Initial load
    fetchAllEvents();
});
