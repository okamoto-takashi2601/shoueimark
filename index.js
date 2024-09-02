const functions = require("firebase-functions");
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const session = require('express-session');
const userRoutes = require('./routes/users');
const settingRoutes = require('./routes/settings');
const productRoutes = require('./routes/products');
const indexRouter = require('./routes/index');
const favicon = require('serve-favicon');
const cors = require('cors')({origin: true});
const bodyParser = require('body-parser');
const flash = require('connect-flash');

const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static( path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname, 'routes')));
app.use( express.urlencoded({ extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use( express.json());
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

const sessionConfig = {
    name:"__session",
    secret: 'oka123',
    resave: false,
    saveUninitialized: true,
    cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());
app.use(cors);


app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'private');
    res.locals.currentUser = req.session.currentUser;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.use('/', userRoutes);
app.use('/products', productRoutes);
app.use('/settings', settingRoutes);
app.use('/', indexRouter);

app.get('/config', (req, res) => {
    res.json({
      apiKey: "AIzaSyDDiYltnHvYB4W8pWRfZxOBY4h7OL7qFZE",
      projectId: "okamoto--test",

    });
  });
  

app.all('*', (req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000, (req, res) =>{
    console.log(`リクエストをポート 3000 portで待ち受け中。。。`)
});




//  export app to firebase functions
exports.app = functions.https.onRequest(app);
