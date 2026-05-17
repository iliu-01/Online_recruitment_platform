const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { port } = require('./config');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes will be mounted by later tasks

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Socket.IO will be initialized in a later task. For now, server starts without it.
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
