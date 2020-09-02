const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router()

dishRouter.use(bodyParser.json())

dishRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => {
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {   // will return an array of dishes
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish Created', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT Operation not supported on /dishes') // Since Put req from client side is not allowed.
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

dishRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403
        res.end('POST Operation not supported on /dishes/' + req.params.dishId) // post operation should not be allowed for /dishId endpoint.
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })


dishRouter.route('/:dishId/comments')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {   // will return an array of dishes
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                }
                else {
                    err = new Error("Dish" + req.params.dishId + ' not Found');
                    err.status = 404;
                    return next(err); // Will be handled by the error handler in the app.js file
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error("Dish" + req.params.dishId + ' not Found');
                    err.status = 404;
                    return next(err); // Will be handled by the error handler in the app.js file
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT Operation not supported on /dishes' + req.params.dishId + '/comments') // Since Put req from client side is not allowed.
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (var i = 0; i <= (dish.comments.length - 1); i++) {
                        dish.comments.id(dish.comments[i]._id).remove();  // passing in the id as parameter and deleting each one by one.
                    }
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err));
                }
                else {
                    err = new Error("Dish" + req.params.dishId + ' not Found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

dishRouter.route('/:dishId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments.id(req.params.commentId));
                }
                else if (dish == null) {
                    err = new Error("Dish" + req.params.dishId + ' not Found');
                    err.status = 404;
                    return next(err); // Will be handled by the error handler in the app.js file
                }
                else {
                    err = new Error("Comments" + req.params.commentId + ' not Found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end('POST Operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId) // post operation should not be allowed for /dishId/comments/commentId endpoint.
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                        err = new Error('You are not authorized to edit this comment!');
                        err.status = 403;
                        return next(error);
                    }
                    if (req.body.rating) {
                        dish.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        dish.comments.id(req.params.commentId).comment = req.body.comment;
                    }
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error("Dish" + req.params.dishId + ' not Found');
                    err.status = 404;
                    return next(err); // Will be handled by the error handler in the app.js file
                }
                else {
                    err = new Error("Comments" + req.params.commentId + ' not Found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                        err = new Error('You are not authorized to delete this comment!');
                        err.status = 403;
                        return next(err);
                    }
                    dish.comments.id(req.params.commentId).remove();
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error("Dish" + req.params.dishId + ' not Found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error("Comments" + req.params.commentId + ' not Found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = dishRouter;