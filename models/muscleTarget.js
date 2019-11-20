var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

// Export your module
var MuscleTargetModels = mongoose.model("MuscleTarget", function () {
    var muscletarget = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });
    muscletarget.plugin(mongooseAggregatePaginate);
    muscletarget.plugin(mongoosePaginate);
    muscletarget.statics.newMuscleTarget = function (muscletarget, callback) {
            muscletarget._id = new ObjectID
            new MuscleTargetModels(muscletarget).save(function (err, response_data) {
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
        muscletarget.statics.editMuscleTarget = function (muscletarget, callback) {
            MuscleTargetModels.findById(muscletarget.id, function (err, doc) {
                if (doc) {
                    doc.name = muscletarget.name;
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
                        "response_message": "Category Not Found"
                    })
                }
            })
        },
        muscletarget.statics.deleteMuscleTarget = function (muscletarget, callback) {
            MuscleTargetModels.findById(muscletarget.id, function (err, doc) {
                if (doc) {
                    doc.name = muscletarget.name;
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
                        "response_message": "MuscleTarget Not Found"
                    })
                }
            })
        }
    muscletarget.statics.getAllMuscleTarget = function (params, callback) {
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
        MuscleTargetModels.paginate(query, {
            // select: 'name email phone city user_type',
            sort: {
                createdAt: -1
            },
            page: page,
            limit: limit
        }, function (err, muscleTarget) {
            if (err) {
                callback({
                    success: false,
                    response_code: 5002,
                    response_message: "Internal server error",
                    errors: err
                });
            } else {
                console.log('meals', muscleTarget);
                callback({
                    success: true,
                    response_code: 2000,
                    response_message: "muscleTarget list",
                    response_data: muscleTarget
                    //result: users
                });
            }
        });
    }
    muscletarget.statics.getAllMuscleTargetList = function (params, callback) {
        MuscleTargetModels.find({}, function (err, muscletarget) {
            if (!err) {
                if (muscletarget) {
                    callback({
                        "response_code": 2000,
                        "response_data": muscletarget
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
        })
    }
    muscletarget.statics.getMuscleTarget = function (data, callback) {
        MuscleTargetModels.findById(data.id, function (err, muscletarget) {
            if (!err) {
                if (muscletarget) {
                    callback({
                        "response_code": 2000,
                        "response_data": muscletarget
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
        })
    }
    return muscletarget;
}());

module.exports = MuscleTargetModels;