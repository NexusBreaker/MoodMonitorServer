const User = require('./Models/User');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();


//Mongoose
mongoose.connect('mongodb://localhost/MoodMonitorDB',{useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

//Express session
app.use(
    session({
        secret: 'moodmonitor',
        resave: true,
        saveUninitialized: true
    })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Init Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/register', (req,res) =>{
    const { username, email, password, password2} = req.body;

    let errors = [];

    if(!username || !email || !password || !password2){
        errors.push({msg: 'Enter all fields!'});
    }

    if(password !== password2){
        errors.push({msg: 'Passwords do not match!'})
    }

    if(errors.length === 0){
        User.findOne({email: email}).then(user =>{

            if(user){
                errors.push({msg: 'Email already exists'});
                res.send(errors);
            }else{
                const newUser = new User({username,email,password});

                bcrypt.genSalt(10, (err, salt) =>{

                    bcrypt.hash(newUser.password, salt, (err, hash) =>{

                        if(err) throw  err;

                        newUser.password = hash;

                        newUser.save()
                            .then(user =>{
                                res.send("User Registered!");
                            })
                            .catch(err => console.log(err));
                    });
                });

            }

        });
    }


});

app.post('/login', (req, res) =>{
    console.log('login');
   passport.authenticate('local', function(req2,res2){
       console.log(req2.user);
   });
});


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(3000, ()=>{
    console.log('Mood Monitor Server running on port 3000!');
});

function configurePassport(){
    passport.use(
        new LocalStrategy(function(username,password,done){

            User.findOne({username: username}, function(err, user){
                if(err) {return done(err);}

                if(!user){
                    return done(null,false,{message: 'Incorrect username'});
                }

                if(!user.validPassword(password)){
                    return done(null,false,{message: 'Incorrect password'});
                }

                return done(null, user);
            });
        })
    );
}

function validPassword(){

}