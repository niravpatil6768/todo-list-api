const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

//const bodyparser = require('body-parser');

const List = require('../models/list');
//const Task = require('../models/task');

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

//router.get('/', )

// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

router.get('/', authenticate, (req, res, next) => {
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
        // res.status(200).json({
        //     message: 'get success'
        // });
    })
    .catch(err => {
        res.sendStatus(500).json({
          error : err
        });
    });
});


/*router.post('/',  (req, res, next) => {
   

    let newList = new List({
        title: req.body.title,
       // _userid: req.user_id
    })
    newList.save().then((listdoc) => {
        res.send(listdoc);
    });
});*/

router.post('/', authenticate, (req, res) => {
    // We want to create a new list and return the new list document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
});




router.patch('/:id', authenticate, (req, res, next) => {
    List.findOneAndUpdate({_id: req.params.id, _userId: req.user_id}, {
        $set: req.body
    }).then(() => {
       // res.sendStatus(200);
       res.send({'message': 'updated successfully'});
    })
    .catch(err => {
        res.sendStatus(500).json({
          error : err
        });
    });
});

router.delete('/:id', authenticate, (req, res) => {
    // We want to delete the specified list (document with id in the URL)
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        // delete all the tasks that are in the deleted list
        deleteTasksFromList(removedListDoc._id);
    })
});

/*router.delete('/:id', (req, res, next) => {
    List.findOneAndRemove(
        {_id: req.params.id}
        )
        .then(() => {
            res.sendStatus(200);
            console.log(res);
        });
    });*/


/* HELPER METHODS */
let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + " were deleted!");
    })
}
/*router.get('/:id/tasks', (req, res, next) => {
    Task.find({
        _listId: req.params.listId
    })
    .then((tasks) => {
        res.send(tasks);
    })
    .catch(err => {
        res.sendStatus(500).json({
          error : err
        });
    });
});

router.post('/:id/tasks', (req, res, next) => {
    let newTask = new Task({
        title: req.body.title
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    })
})*/
module.exports = router;