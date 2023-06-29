const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const bodyparser = require('body-parser');

//const List = require('../models/list');
const Task = require('../models/task');


router.get('/:listId/tasks', (req, res, next) => {
    Task.find({
        _listId: req.params.listId
    })
    .then((tasks) => {
        res.send(tasks);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500).json({
          error : err
        });
    });
});

router.post('/:listId/tasks', (req, res, next) => {
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
        console.log(title);
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

router.patch('/:listId/tasks/:taskId', (req, res, next) => {
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        _listId: req.params.listId
    },
    {
        $set: req.body
    }).then(() => {
        res.send({message: 'updated successfully'});
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500).json({
          error : err
        });
    });
});

router.delete('/:listId/tasks/:taskId', (req, res, next) => {
    Task.findOneAndRemove({
        _id: req.params.taskId,
        _listId: req.params.listId
    } )
        .then(() => {
            res.sendStatus(200);
            console.log(res);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500).json({
              error : err
            });
        });
});
/*router.post('/:listId/tasks', (req, res, next) => {
    List.findById( req.params.id).then(tasks => {
        const newTask = new Task({
            title : req.body.title
        })
        newTask.save().then((taskDoc) => {
            res.send(taskDoc);
            console.log(title);
        })
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500).json({
          error : err
        });
    });
});*/

module.exports = router;