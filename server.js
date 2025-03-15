const express = require('express');
const path = require('path');
const app = express();
let PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server with fallback to other ports if 3000 is in use
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT} to play the blackjack game!`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        // If port 3000 is in use, try port 3001, then 3002, etc.
        PORT += 1;
        console.log(`Port ${PORT-1} is busy, trying port ${PORT} instead...`);
        server.close();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Open your browser and navigate to http://localhost:${PORT} to play the blackjack game!`);
        });
    } else {
        console.error('Error starting server:', err);
    }
});