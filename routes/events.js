// /routes/events.js
const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cache = require('../utils/cache');
const { calculateSuitability } = require('../utils/scoring');

const DB_PATH = path.join(__dirname, '..', 'data', 'events.json');
const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// --- Helper Functions ---
const readEvents = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return []; // File not found, return empty array
        throw error;
    }
};

const writeEvents = async (events) => {
    await fs.writeFile(DB_PATH, JSON.stringify(events, null, 2));
};

// --- Weather Service Logic ---
const getWeatherForecast = async (location) => {
    const cacheKey = `weather_${location.toLowerCase()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log(`[Cache] HIT for ${location}`);
        return cachedData;
    }
    console.log(`[API] FETCH for ${location}`);

    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        // Transform data to our internal format
        const transformedData = response.data.list.map(item => ({
            date: item.dt_txt.split(' ')[0], // YYYY-MM-DD
            time: item.dt_txt.split(' ')[1], // HH:MM:SS
            temp: item.main.temp, // Celsius
            condition: item.weather[0].main, // e.g., 'Clear', 'Rain'
            precipitation_prob: item.pop, // Probability of precipitation
            wind_speed: item.wind.speed * 3.6 // Convert m/s to km/h
        }));

        // Get unique daily forecast around noon
        const dailyForecasts = [];
        const seenDays = new Set();

        for (const forecast of transformedData) {
            if (!seenDays.has(forecast.date)) {
                // Prioritize forecast around noon (12:00:00)
                const noonForecast = transformedData.find(f => f.date === forecast.date && f.time === "12:00:00");
                if(noonForecast) {
                    dailyForecasts.push(noonForecast);
                    seenDays.add(forecast.date);
                } else if (seenDays.size < 5) { // Fallback to first available
                    dailyForecasts.push(forecast);
                    seenDays.add(forecast.date);
                }
            }
        }

        cache.set(cacheKey, dailyForecasts);
        return dailyForecasts;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) throw new Error(`Location '${location}' not found.`);
            if (error.response.status === 401) throw new Error('Invalid API Key.');
        }
        throw new Error('Weather service is currently unavailable.');
    }
};


// --- API Endpoints ---

// POST /api/events - Create an event
router.post('/events', async (req, res, next) => {
    try {
        const { name, location, date, eventType } = req.body;
        if (!name || !location || !date || !eventType) {
            return res.status(400).json({ error: 'Missing required event details.' });
        }
        const events = await readEvents();
        const newEvent = { id: uuidv4(), ...req.body };
        events.push(newEvent);
        await writeEvents(events);
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
});

// GET /api/events - List all events
router.get('/events', async (req, res, next) => {
    try {
        const events = await readEvents();
        res.json(events);
    } catch (error) {
        next(error);
    }
});

// GET /api/events/:id/suitability - Get weather suitability score for an event
router.get('/events/:id/suitability', async (req, res, next) => {
    try {
        const events = await readEvents();
        const event = events.find(e => e.id === req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found.' });

        const forecast = await getWeatherForecast(event.location);
        const eventWeather = forecast.find(f => f.date === event.date);

        if (!eventWeather) {
            return res.status(404).json({ error: `Weather forecast not available for ${event.date}. Forecasts are typically available for the next 5 days.` });
        }

        const suitability = calculateSuitability(eventWeather, event.eventType);
        res.json({
            event,
            weather: eventWeather,
            suitability
        });
    } catch (error) {
        next(error);
    }
});


// GET /api/events/:id/alternatives - Get better weather dates
router.get('/events/:id/alternatives', async (req, res, next) => {
    try {
        const events = await readEvents();
        const event = events.find(e => e.id === req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found.' });

        const forecast = await getWeatherForecast(event.location);
        if (!forecast || forecast.length === 0) {
            return res.status(404).json({ error: `No weather forecast available for ${event.location}` });
        }

        const alternatives = forecast.map(dailyWeather => {
            const suitability = calculateSuitability(dailyWeather, event.eventType);
            return {
                date: dailyWeather.date,
                score: suitability.score,
                weather: {
                    temp: `${dailyWeather.temp.toFixed(1)}°C`,
                    condition: dailyWeather.condition,
                    wind: `${dailyWeather.wind_speed.toFixed(1)} km/h`
                }
            };
        }).sort((a, b) => b.score - a.score); // Sort by best score

        const currentEventWeather = forecast.find(f => f.date === event.date);
        const currentScore = currentEventWeather ? calculateSuitability(currentEventWeather, event.eventType).score : 0;

        const betterAlternatives = alternatives.filter(alt => alt.score > currentScore && alt.date !== event.date);

        if (betterAlternatives.length === 0) {
            return res.json({ message: 'No better weather days found in the forecast.', alternatives });
        }

        res.json({ message: 'Alternative dates with better weather:', alternatives: betterAlternatives });
    } catch (error) {
        next(error);
    }
});


module.exports = router;
