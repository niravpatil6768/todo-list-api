const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

//middleware

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//const User = require('./api/models/users');

app.use((req, res, next) => {  
    res.header("Access-Control-Allow-Origin", '*');
    res.header('Access-Control-Allow-Headers',
     'Origin, X-Requested-With, Content-Type, Accept, Authorization');
     if(req.method === 'OPTIONS') {
       res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
       return res.status(200).json({});
     }
     next();
});

//verify refresh token middleware(which will be verify the session)
/*let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');

    //grab the _id from the request header
    let _id = req.header('_id');
    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if(!user){
            return Promise.reject({
                'error': 'User not found. make sure that refresh token abd user id are correct'
            });
        }

        //if the code reaches here - the user was found
        //therefore the refresh token exists in the database - but we still have to check if it has exists
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken){
                //check if the session has expired
                if(User.hasRefreshTokenExpired(session.expiresAt) === false){
                    isSessionValid = true;
                }
            }
        });

        if(isSessionValid){
            //the session is valid - call next() to continue with processing this web request
            next();
        }else{
            //the session is not valid
            return Promise.reject({
                'error':'refresh token has expired or the session is invalid'
            })
        }
    }).catch((e) => {
        res.status(401).send(e);
    })
}*/


const listRoutes = require('./api/routes/lists');
const taskRoutes = require('./api/routes/tasks');
const userRoutes = require('./api/routes/users');
const { findLastIndex } = require('lodash');

app.use('/lists', listRoutes);
app.use('/lists', taskRoutes);
app.use('/users', userRoutes);

mongoose.Promise = global.Promise;

mongoose.connect('mongodb+srv://nirav67:npn987654@cluster1.gic9ieo.mongodb.net/?retryWrites=true&w=majority').then(() => {
     console.log("connect to DB");
})
.catch((e) => {
    console.log("not able to connect with DB");
    console.log(e);
});

// to handle CORS(cross-origin) erros
/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });*/

//app.use('/lists', listRoutes);
//app.use('/tasks', taskRoutes);


// to prevent deprectation warning( from mongoDB native drive)
//mongoose.set('useCreateIndex', true);
//mongoose.set('useFindAndModify', false);


/*app.get('/' ,(req, res, next) => {
    res.status(200).json({
        message: 'its work'
    });
});*/

/*app.get('/users/me/access-token', verifySession, (req, res) => {
    //we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({accessToken});
    }).catch((e) => {
        res.status(400).send(e);
    })
})*/

module.exports = app;
/*module.exports = {
    mongoose
}*/