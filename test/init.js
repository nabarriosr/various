
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router/router');
const cookieSession = require('cookie-session');
const middlewares = require('./middlewares/middlewares');

const port = 8080;
const app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "jade");
app.use(cookieSession({
	name: 'sessionUser',
	keys: ['key1', 'key2']
}));
app.use('/home', middlewares.sessionUser);
router(app);
app.use('/img', express.static('uploads'));

app.listen(port);
console.log("Running on port " + port);