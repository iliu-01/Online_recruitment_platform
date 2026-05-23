const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { port } = require('./config');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const { io } = initSocket(server);

// 挂载 io 供 services 使用
app.set('io', io);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
