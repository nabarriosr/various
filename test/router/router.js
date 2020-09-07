const user = require('../model/mongo');
const path = require('path');
const md5 = require('md5');
const fs = require('fs');
const multer = require('multer'); 

const router = app => {
    // Login
    app.get("/login", function (req, res) {
        res.render("login");
    });
    app.post('/login', (req, res) => {
        let query = user.findOne({ 'username': req.body.username });
        query.exec(function (err, user) {
            if (err) return handleError(err);
            if(user == null){
                res.render("message", { message: "The user doesn't exist" });
            } else if (user.passwordHash != md5(req.body.password)) {
                res.render("message", { message: "Wrong password" });
            } else {
                req.session.user = true;
                req.session.username = req.body.username;
                req.session.email = user.email;
                req.session.genre = user.genre;
                res.redirect('/home');
            }
        });
    });

    //Logout 
    app.get('/logout',(req, res) => {
        req.session.user = false;
        res.redirect('/home');
    });

    // Register
    app.get("/register", function (req, res) {
        res.render("register");
    });
    var storage = multer.diskStorage({ 
        destination: (req, file, cb) => { 
            cb(null, 'uploads') 
        }, 
        filename: (req, file, cb) => { 
            cb(null, req.body.username + '.jpeg') 
        } 
    });
    var upload = multer({ storage: storage }); 
    app.post("/register", upload.single('photo'), function (req, res) {
        var userRegister = new user({
            username: req.body.username,
            email: req.body.email,
            genre: req.body.genre,
            passwordHash: md5(req.body.password),
            img: { data: fs.readFileSync(path.join(__dirname + '/../uploads/' + req.file.filename)), contentType: 'image/jpeg' }
        });
        let query = user.findOne({ 'username': req.body.username });
        query.exec(function (err, user) {
            if(user == null){
                userRegister.save(function (){
                    res.render("message", { message: "Register Succesfull, back and login" });
                });
            } else {
                res.render("message", { message: "The user already exist"});
            }
            
        });

        
    });

    //Home
    app.get("/home", function (req, res) {
        if(!req.session.user){
            res.redirect('/login');
        } else {
            let switchGenre;
            if(req.session.genre == 'M'){ 
                switchGenre = 'F';
            } else {
                switchGenre = 'M';
            }
            let query = user.find({ 'genre': switchGenre });
            query.exec(function (err, user) {
                let usersFound = [];
                if (err) return handleError(err);
                for(var i = 0; i < user.length; i++){
                    usersFound.push([user[i].username, user[i].genre]);
                }
                res.render("home", { usersFound: usersFound, userInfo: req.session });
            });
        }
    });



};





module.exports = router;