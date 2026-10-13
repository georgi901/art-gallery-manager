const path = require('node:path');

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');
const { createCrudRouter } = require('./routes/crud.routes');
const { createJunctionRouter } = require('./routes/junction.routes');
const reportRouter = require('./routes/report.routes');
const viewRouter = require('./routes/view.routes');
const cascadeRouter = require('./routes/cascade.routes');
const authRouter = require('./routes/auth.routes');
const uploadRouter = require('./routes/upload.routes');
const authenticate = require('./middleware/authenticate');
const userRouter = require('./routes/user.routes');
const { getJunction, getResource } = require('./utils/resourceConfig');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, 'CORS_ORIGIN_FORBIDDEN', 'Origin is not allowed'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
    },
    message: 'API is running',
  });
});

app.use('/api/auth', authRouter);
app.use('/api', userRouter);
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')));
app.use('/api', authenticate);
app.use('/api', reportRouter);
app.use('/api', cascadeRouter);
app.use('/api/views', viewRouter);
app.use('/api', uploadRouter);

['galleries', 'artists', 'artworks', 'exhibitions', 'locations', 'sponsors', 'awards'].forEach(
  (resource) => {
    const config = getResource(resource);
    app.use(`/api/${resource}`, createCrudRouter(resource));
    config.aliases.forEach((alias) => {
      app.use(`/api/${alias}`, createCrudRouter(resource));
    });
  }
);

['sponsorships', 'exhibition-artworks', 'artwork-awards'].forEach((resource) => {
  const config = getJunction(resource);
  app.use(`/api/${resource}`, createJunctionRouter(resource));
  config.aliases.forEach((alias) => {
    app.use(`/api/${alias}`, createJunctionRouter(resource));
  });
});

app.use((req, res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Resource not found'));
});

app.use(errorHandler);

module.exports = app;
