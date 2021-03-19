const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const csrf = require('csurf');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const passport = require('passport');

const globalErrorHandler = require('./controllers/errorController');

const indexRouter = require('./routes/indexRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const adminRouter = require('./routes/adminRoutes');
const menuRouter = require('./routes/menuRoutes');

const app = express();

dotenv.config({ path: 'config.env' });

app.enable('trust proxy');

// Set Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Set flash
app.use(flash());

// Method override
app.use(
  methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.use(expressLayout);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set Cookie parser
app.use(cookieParser());

app.use(csrf({ cookie: true }));

// Set Session Config
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24
    }, // 24 hour
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// Passport config
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// Set security HTTP headers
app.use(helmet());

//Limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  messege: 'Too many requests from this IP, Please try again in an hour!'
});
app.use('/', limiter);

app.use((req, res, next) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token);
  res.locals.csrfToken = token;
  next();
});

//Date sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

// Implement CORS
app.use(cors());

app.options('*', cors());

app.use(compression());

app.disable('x-powered-by');

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/orders', orderRouter);
app.use('/admin', adminRouter);
app.use('/menu', menuRouter);

// When someone access route that does not exist
app.all('*', (req, res, next) => {
  res.status(404).render('error/404');
});

// Handling Global Errors
app.use(globalErrorHandler);

module.exports = app;
