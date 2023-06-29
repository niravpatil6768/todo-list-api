const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const bodyparser = require('body-parser');

const List = require('../models/list');
//const Task = require('../models/task');

//router.get('/', )

router.get('/', (req, res, next) => {
    List.find({}).then((lists) => {
        res.send(lists);
        console.log(lists);
        res.status(200).json({
            message: 'get success'
        });
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500).json({
          error : err
        });
    });
});


router.post('/', (req, res, next) => {
   

    let newList = new List({
        title: req.body.title
    })
    newList.save().then((listdoc) => {
        res.send(listdoc);
        console.log(title);
    });
});



router.patch('/:id', (req, res, next) => {
    List.findOneAndUpdate({_id: req.params.id}, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500).json({
          error : err
        });
    });
});

router.delete('/:id', (req, res, next) => {
    List.findOneAndRemove(
        {_id: req.params.id}
        )
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
/*router.get('/:id/tasks', (req, res, next) => {
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

router.post('/:id/tasks', (req, res, next) => {
    let newTask = new Task({
        title: req.body.title
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
        console.log(newTaskDoc);
    })
})*/
module.exports = router;