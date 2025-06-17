// /utils/scoring.js
const SCORE_THRESHOLDS = {
    'Outdoor Sports': {
        temp: { ideal: [15, 30], points: 30 },
        precipitation: { max: 20, points: 25 },
        wind: { max: 20, points: 20 },
        condition: { ideal: ['Clear', 'Clouds'], points: 25 }
    },
    'Wedding': {
        temp: { ideal: [18, 28], points: 30 },
        precipitation: { max: 10, points: 30 },
        wind: { max: 15, points: 25 },
        condition: { ideal: ['Clear', 'Clouds'], points: 15 }
    },
    'Hiking Trip': {
        temp: { ideal: [10, 25], points: 30 },
        precipitation: { max: 30, points: 25 },
        wind: { max: 25, points: 20 },
        condition: { ideal: ['Clear', 'Clouds', 'Mist'], points: 25 }
    }
    // Add other event types here
};

const calculateSuitability = (weatherData, eventType) => {
    const criteria = SCORE_THRESHOLDS[eventType] || SCORE_THRESHOLDS['Outdoor Sports']; // Default to sports
    if (!weatherData) {
        return { score: 0, breakdown: {}, message: "Weather data not available." };
    }

    let score = 0;
    const breakdown = {};

    // Temperature Score
    if (weatherData.temp >= criteria.temp.ideal[0] && weatherData.temp <= criteria.temp.ideal[1]) {
        score += criteria.temp.points;
        breakdown.temp = `+${criteria.temp.points} (Ideal)`;
    } else {
        breakdown.temp = `+0 (Not Ideal)`;
    }

    // Precipitation Score
    if (weatherData.precipitation_prob * 100 <= criteria.precipitation.max) {
        score += criteria.precipitation.points;
        breakdown.precipitation = `+${criteria.precipitation.points} (Low chance)`;
    } else {
        breakdown.precipitation = `+0 (High chance)`;
    }

    // Wind Score
    if (weatherData.wind_speed <= criteria.wind.max) {
        score += criteria.wind.points;
        breakdown.wind = `+${criteria.wind.points} (Calm)`;
    } else {
        breakdown.wind = `+0 (Windy)`;
    }

    // Weather Condition Score
    if (criteria.condition.ideal.includes(weatherData.condition)) {
        score += criteria.condition.points;
        breakdown.condition = `+${criteria.condition.points} (Good)`;
    } else {
        breakdown.condition = `+0 (Not Ideal)`;
    }

    return { score, breakdown };
};

module.exports = { calculateSuitability };
