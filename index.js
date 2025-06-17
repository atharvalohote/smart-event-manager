// index.js
require('dotenv').config();
const express = require('express');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // <-- THIS IS THE MODIFIED LINE, ADDED HERE

app.get('/', (req, res) => {
    res.send('Welcome to the Smart Event Planner API!');
});

app.use('/api', eventRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
