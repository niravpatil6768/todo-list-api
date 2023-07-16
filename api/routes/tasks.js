const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

//const bodyparser = require('body-parser');

const List = require('../models/list');
const Task = require('../models/task');

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



router.get('/:listId/tasks', authenticate, (req, res, next) => {
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

router.post('/:listId/tasks', authenticate, (req, res, next) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list){
            //user object with specified conditions was found
            //therefore the currently authenticated user can create new tasks
            return true;
        }
        //the user object is undefined
        return false;
    }).then((canCreateTask) => {
        if(canCreateTask){
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            }) 
        }else{
            res.sendStatus(404);
        }
    })
    
});

router.get('/:listId/tasks/:taskId', (req, res, next) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    })
})

router.patch('/:listId/tasks/:taskId', authenticate, (req, res, next) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list){
            //list object with the specified conditions was found
            //therefore the currently authenticated user can make update to tasks within this list
            return true;
        }

        return false;
    }).then((canUpdateTasks) => {
        if(canUpdateTasks){
            
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            },
            {
                $set: req.body
            }).then(() => {
                res.send({message: 'updated successfully'});
            })

        }else{
            res.sendStatus(404);
        }
    })
   
});

router.delete('/:listId/tasks/:taskId', authenticate, (req, res, next) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list){
            //list object with the specified conditions was found
            //therefore the currently authenticated user can make update to tasks within this list
            return true;
        }

        return false;
    }).then((canDeleteTasks) => {

        if(canDeleteTasks){
        Task.findOneAndRemove({
            _id: req.params.taskId,
            _listId: req.params.listId
        } )
            .then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            }) 
        }
        else{
            res.sendStatus(404);
        }
    });   
});
/*router.post('/:listId/tasks', (req, res, next) => {
    List.findById( req.params.id).then(tasks => {
        const newTask = new Task({
            title : req.body.title
        })
        newTask.save().then((taskDoc) => {
            res.send(taskDoc);
        })
    })
    .catch(err => {
        res.sendStatus(500).json({
          error : err
        });
    });
});*/

module.exports = router;