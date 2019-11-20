var express = require("express");
var AdminModels = require('../models/admin');
var WorkOutModels = require('../models/workout');
var config = require('../config');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var secretKey = config.secretKey;
var async = require("async");
var mongo = require('mongodb');
var crypto = require('crypto');
var sha1 = require('node-sha1');
var ObjectID = mongo.ObjectID;
var baseUrl = config.baseUrl;

var workoutservice = {
    addWorkOut: (data, callback) => {
        //  callback(data);
        async.waterfall([
            function (nextCb) {
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide name",
                        "response_data": {}
                    });
                }
                if (!data.workout_type || typeof data.workout_type === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide WorkOut Type",
                        "response_data": {}
                    });
                }
                if (!data.muscle_target || typeof data.muscle_target === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide Muscle Target",
                        "response_data": {}
                    });
                }
                if (!data.equipment || typeof data.equipment === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide Equipment",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {
                        "response_code": 2000
                    });
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    WorkOutModels.addWorkout(data, function (workout) {
                        nextCb(null, workout);
                    })
                }
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (!err) {
                //console.log(content);
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "WorkOut Added successfully.",
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5000) {
                    //callback(content);
                    callback({
                        "response_code": 5000,
                        "response_message": content.response_message,
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
            }
        })
    },
    updateWorkOut: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide name",
                        "response_data": {}
                    });
                }
                if (!data.workout_type || typeof data.workout_type === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide WorkOut Type",
                        "response_data": {}
                    });
                }
                if (!data.muscle_target || typeof data.muscle_target === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide Muscle Target",
                        "response_data": {}
                    });
                }
                if (!data.equipment || typeof data.equipment === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide Equipment",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {
                        "response_code": 2000
                    });
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    WorkOutModels.editWorkout(data, function (workout) {
                        nextCb(null, workout);
                    })
                }
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (!err) {
                //console.log(content);
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "WorkOut Updated successfully.",
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5000) {
                    //callback(content);
                    callback({
                        "response_code": 5000,
                        "response_message": content.response_message,
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
            }
        })
    },
    deleteWorkOut: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.id || typeof data.id === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide id",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {
                        "response_code": 2000
                    });
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    WorkOutModels.deleteWorkout(data, function (workout) {
                        nextCb(null, workout);
                    })
                }
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (!err) {
                //console.log(content);
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "WorkOut Deleted successfully.",
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5000) {
                    //callback(content);
                    callback({
                        "response_code": 5000,
                        "response_message": content.response_message,
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
            }
        })
    },
    getAllWorkOut: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    WorkOutModels.getAllWorkOut(data, function (workout) {
                        nextCb(null, workout);
                    })
                }
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (!err) {
                //console.log(content);
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "WorkOut",
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5000) {
                    //callback(content);
                    callback({
                        "response_code": 5000,
                        "response_message": content.response_message,
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
            }
        })
    },
    getWorkOut: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.id || typeof data.id === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide id",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {
                        "response_code": 2000
                    });
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    WorkOutModels.getWorkOut(data, function (workout) {
                        nextCb(null, workout);
                    })
                }
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (!err) {
                //console.log(content);
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "WorkOut",
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5000) {
                    //callback(content);
                    callback({
                        "response_code": 5000,
                        "response_message": content.response_message,
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
            }
        })
    }

}

module.exports = workoutservice;