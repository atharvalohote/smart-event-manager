# Smart Event Planner API & Frontend

This is a full-stack application designed to help users plan outdoor events by providing intelligent weather recommendations. The backend is built with Node.js and Express, integrating with the OpenWeatherMap API to fetch 5-day weather forecasts. The system analyzes weather data and provides a suitability score for events, suggesting better dates if conditions are poor.

The project also includes a simple, responsive frontend built with vanilla HTML, CSS, and JavaScript to demonstrate the API's functionality in a user-friendly interface.

**Live Application Link:** [Link to Deployed Application](your-deployment-link-here)

![Frontend Screenshot](https://i.imgur.com/3sL9g8L.png)

---

### Features Implemented

**Backend:**
-   REST API for creating and listing events (`/api/events`).
-   Real-time integration with the OpenWeatherMap 5-day forecast API.
-   Dynamic, point-based weather suitability scoring system that is tailored to the event type (e.g., 'Outdoor Sports', 'Wedding').
-   Recommendation engine (`/api/events/:id/alternatives`) to suggest alternative dates with better weather conditions.
-   In-memory caching strategy to reduce redundant API calls and improve performance.
-   Graceful error handling for invalid locations or API failures.

**Frontend (Optional Extra Credit):**
-   Clean, responsive form to create new events.
-   Dynamic list that displays all upcoming events.
-   Live weather suitability score and conditions are fetched and displayed on each event card.
-   Functionality to trigger the "Find better dates" recommendation from the UI.

---

### Tech Stack

-   **Backend:** Node.js, Express.js
-   **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
-   **External API:** OpenWeatherMap
-   **Development Environment:** WebStorm IDE

---

### Setup & Local Installation

**1. Clone the Repository**
   ```bash
   git clone [https://github.com/your-username/smart-event-planner.git](https://github.com/your-username/smart-event-planner.git)
   ```

**2. Navigate into the Project Directory**
   ```bash
   cd smart-event-planner
   ```

**3. Install Dependencies**
   This command installs all the necessary packages like Express and Axios.
   ```bash
   npm install
   ```

**4. Set Up Environment Variables**
   Create a file named `.env` in the root of the project. Add your OpenWeatherMap API key to this file:
   ```
   OPENWEATHERMAP_API_KEY=your_secret_api_key_here
   ```

---

### How to Run

1.  Make sure you have completed the setup steps above.
2.  Run the following command to start the server:
    ```bash
    node index.js
    ```
3.  You will see a confirmation message: `Server is running on http://localhost:3000`.
4.  To use the application, open your web browser and navigate to **`http://localhost:3000`**.

### API Endpoints

The core API is available under the `/api` path.

| Method | Endpoint                       | Description                                |
| :----- | :----------------------------- | :----------------------------------------- |
| `POST` | `/api/events`                  | Creates a new event.                       |
| `GET`  | `/api/events`                  | Lists all created events.                  |
| `GET`  | `/api/events/:id/suitability`  | Gets the weather score for a specific event. |
| `GET`  | `/api/events/:id/alternatives` | Suggests better dates for an event.        |
