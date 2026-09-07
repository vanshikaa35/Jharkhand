const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// Middleware
app.use(cors());

app.use(
    express.json()
);


// Routes
const problemRoutes =
    require("./routes/problemRoutes");

app.use(
    "/api/problems",
    problemRoutes
);


// Test route
app.get("/", (req, res) => {

    res.json({
        message:
            "Jharkhand Civic Innovation API is running!"
    });

});


// Start server
const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);