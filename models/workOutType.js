var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

// Export your module
var WorkOutTypeModels = mongoose.model("WorkOutType", function () {
    var workouttype = new mongoose.Schema({
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
        },

    }, {
        timestamps: true
    });
    workouttype.plugin(mongooseAggregatePaginate);
    workouttype.plugin(mongoosePaginate);
    workouttype.statics.newWorkOutType = function (workouttype, callback) {
            workouttype._id = new ObjectID
            new WorkOutTypeModels(workouttype).save(function (err, response_data) {
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
        workouttype.statics.editWorkOutType = function (workouttype, callback) {
            WorkOutTypeModels.findById(workouttype.id, function (err, doc) {
                if (doc) {
                    doc.name = workouttype.name;
                    doc.isBlocked = workouttype.isBlocked;
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
                        "response_message": "WorkOut Type Not Found"
                    })
                }
            })
        },
        workouttype.statics.deleteWorkOutType = function (workouttype, callback) {
            WorkOutTypeModels.findById(workouttype.id, function (err, doc) {
                if (doc) {
                    doc.name = workouttype.name;
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
                        "response_message": "WorkOut Type Not Found"
                    })
                }
            })
        }
    workouttype.statics.getAllWorkOutType = function (params, callback) {
        page = 1;
        limit = 10;
        query = {};
        sort = {
            createdAt: -1
        };
        if (params.page) {
            page = parseInt(params.page);
        }
        if (params.limit) {
            limit = parseInt(params.limit);
        }
        if (params.sortby) {
            sort[params.sortby] = params.sortOrder;
        }
        WorkOutTypeModels.paginate(query, {
            // select: 'name email phone city user_type',
            sort,
            page: page,
            limit: limit
        }, function (err, workouttypes) {
            if (err) {
                callback({
                    success: false,
                    response_code: 5002,
                    response_message: "Internal server error",
                    errors: err
                });
            } else {
                console.log('programs', workouttypes);
                callback({
                    success: true,
                    response_code: 2000,
                    response_message: "workouttypes list",
                    response_data: workouttypes
                    //result: users
                });
            }
        });
    }
    workouttype.statics.getAllWorkOutTypeList = function (params, callback) {
        WorkOutTypeModels.find({}, function (err, workouttype) {
            if (!err) {
                if (workouttype) {
                    callback({
                        "response_code": 2000,
                        "response_data": workouttype
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
    workouttype.statics.getWorkOutType = function (data, callback) {
        WorkOutTypeModels.findById(data.id, function (err, workouttype) {
            if (!err) {
                if (workouttype) {
                    callback({
                        "response_code": 2000,
                        "response_data": workouttype
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
    return workouttype
}());

module.exports = WorkOutTypeModels;