const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//const jwt = require('jsonwebtoken');

//import user from models
const User = require('../models/users');


router.use((req, res, next) => {  
    res.header("Access-Control-Allow-Origin", '*');
    res.header('Access-Control-Allow-Headers',
     'Origin, X-Requested-With, Content-Type, Accept, Authorization');

     res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
     );

     if(req.method === 'OPTIONS') {
       res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
       return res.status(200).json({});
     }
     next();
});
/*router.post('/', (req, res, next) => {
    User.find({
        email: req.body.email
    }).exec()
    .then(user => {
        if(user.length >= 1){
            return res.status(409).json({
                message: "Mail exists"
            });
        }else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err){
                    return res.status(500).json({
                        error: err
                    });
                    
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(result => {
                        res.status(201).json({
                            message: 'User created',
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error : err
                        });
                    });
                }
            });
              
        }
    });
   
});


router.post('/login',(req, res, next) => {
    User.find({ email: req.body.email})
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message: 'mail not found, user doesn\'t exist'
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: 'Auth Failed'
                });
            }
            if(result){
              
                return res.status(200).json({
                    message: 'Auth successfull',
                   // token : token
                });
            }
            res.status(401).json({
                message: 'Auth Failed'
            });
        });
    })
    .catch(err => {
        res.status(500).json({
            error : err
        });
    });
})*/

//verify refresh token middleware(which will be verify the session
let verifySession = (req, res, next) => {
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
}


router.post('/', (req, res, next) => {
   
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        //session created successfully - refreshtoken returned.
        //now we generate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            return {accessToken, refreshToken}
        });
}).then((authTokens) => {
    res
    .header('x-refresh-token', authTokens.refreshToken)
    .header('x-access-token', authTokens.accessToken)
    .send(newUser);
}).catch((e) => {
    res.status(400).send(e);
})
   
});

router.post('/login',(req, res, next) => {
   let email = req.body.email;
   let password = req.body.password;

   User.findByCredentials(email, password).then((user) => {
    return user.createSession().then((refreshToken) => {
       
        return user.generateAccessAuthToken().then((accessToken) => {
            return {accessToken, refreshToken}
        });
    }).then((authTokens) => {
        res
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(user);
    })
    }).catch((e) => {
        res.status(400).send(e);
   })
});

router.get('/me/access-token', verifySession, (req, res) => {
    //we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({accessToken});
    }).catch((e) => {
        res.status(400).send(e);
    })
})




module.exports = router; 