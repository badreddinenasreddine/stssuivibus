const express = require('express');
const path = require('path');
const app = express();
const PORT = 3003; // Changed port to 3003

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Bus Tracking App!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
