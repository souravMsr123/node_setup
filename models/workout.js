var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
// var mealCatSchema = require('../models/mealCategory'); Export your module
var WorkOutModels = mongoose.model("WorkOut", function () {
    var workout = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        workout_type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkOutType',
            required: true
        },
        muscle_target: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MuscleTarget',
            required: true
        },
        equipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment',
            required: true
        },
        image_url: [{
            value: {
                type: String,
                required: false
            }
        }],
        video_url: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });
    workout.plugin(mongooseAggregatePaginate);
    workout.plugin(mongoosePaginate);
    workout.statics.addWorkout = function (workout, callback) {
            workout._id = new ObjectID;
            new WorkOutModels(workout).save(function (err, response_data) {
                if (!err) {
                    callback({
                        "response_code": 2000,
                        response_data
                    });
                } else {
                    console.log(err);
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": err
                    })
                }
            })
        },
        workout.statics.uploadImage = function (workout, callback) {

            // WorkOutModels.findByIdAndUpdate(workout.id, workout, function (err, workoutData) {

            //     //console.log('user data', userdata); console.log('user error', err);
            //     if (err) {
            //         console.log('error....', err);
            //         callback({
            //             "response_code": 5005,
            //             "response_message": "INTERNAL DB ERROR",
            //             "response_data": err
            //         })
            //     }
            //     if (workoutData) {
            //         console.log(7777, workoutData);
            //         callback({
            //             "response_code": 2000,
            //             workoutData
            //         });

            //     } else {
            //         callback({
            //             "response_code": 5005,
            //             "response_message": "Workout Not Found"
            //         })
            //     }
            // })
        },
        workout.statics.editWorkout = function (workout, callback) {
            WorkOutModels.findById(workout.id, function (err, doc) {
                if (doc) {
                    doc.name = workout.name;
                    doc.image_url = workout.image_url;
                    doc.video_url = workout.video_url;
                    doc.equipment = workout.equipment;
                    doc.workout_type = workout.workout_type;
                    doc.muscle_target = workout.muscle_target;
                    doc.description = workout.description;
                    doc.isBlocked = workout.isBlocked;
                    doc.save(function (err, response_data) {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        } else {
                            callback({
                                "response_code": 2000,
                                response_data
                            })
                        }
                    });
                } else {
                    callback({
                        "response_code": 5005,
                        "response_message": "Workout Not Found"
                    })
                }
            })
        },
        workout.statics.deleteWorkout = function (workout, callback) {
            WorkOutModels.findById(workout.id, function (err, doc) {
                if (doc) {
                    doc.remove(function (err, response_data) {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        } else {
                            callback({
                                "response_code": 2000,
                                response_data
                            })
                        }
                    });
                } else {
                    callback({
                        "response_code": 5005,
                        "response_message": "Workout  Not Found"
                    })
                }
            })
        },
        workout.statics.getWorkOut = function (data, callback) {
            WorkOutModels.findById(data.id, function (err, workout) {
                    if (!err) {
                        if (workout) {
                            callback({
                                "response_code": 2000,
                                "response_data": workout
                            })
                        } else {
                            callback({
                                "response_code": 2000,
                                "response_data": {}
                            })
                        }
                    } else {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    }
                }).populate('workout_type')
                .populate('muscle_target')
                .populate('equipment')
        },
        workout.statics.getAllWorkOut = function (params, callback) {



            page = 1;
            limit = 10;
            query = {};
            sort = {};
            if (params.page) {
                page = parseInt(params.page);
            }
            if (params.limit) {
                limit = parseInt(params.limit);
            }
            if (params.sortby) {
                sort[params.sortby] = params.sortOrder;
            }
            WorkOutModels.paginate(query, {
                // select: 'name email phone city user_type',
                sort: {
                    createdAt: -1
                },
                populate: [
                    'workout_type',
                    'muscle_target',
                    'equipment'
                ],
                page: page,
                limit: limit
            }, function (err, workouts) {
                if (err) {
                    callback({
                        success: false,
                        response_code: 5002,
                        response_message: "Internal server error",
                        errors: err
                    });
                } else {
                    console.log('workouts', workouts);
                    callback({
                        success: true,
                        response_code: 2000,
                        response_message: "workouts list",
                        response_data: workouts
                        //result: users
                    });
                }
            });
        }


    return workout;
}());

module.exports = WorkOutModels;