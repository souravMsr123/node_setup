var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var ProgrameModels = mongoose.model("Programe", function () {
    var programe = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            rquired: false
        },
        image_url: {
            type: String,
            required: false
        },
        duration: {
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
    programe.plugin(mongooseAggregatePaginate);
    programe.plugin(mongoosePaginate);
    programe.statics.addPrograme = function (programe, callback) {
            programe._id = new ObjectID;
            new ProgrameModels(programe).save(function (err, response_data) {
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
        programe.statics.uploadImage = function (programe, callback) {
            ProgrameModels.findByIdAndUpdate(programe.id, programe, function (err, programeData) {

                //console.log('user data', userdata); console.log('user error', err);
                if (err) {
                    console.log('error....', err);
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": err
                    })
                }
                if (programeData) {
                    console.log(7777, programeData);
                    callback({
                        "response_code": 2000,
                        programeData
                    });

                } else {
                    callback({
                        "response_code": 5005,
                        "response_message": "User Not Found"
                    })
                }
            })
        },
        programe.statics.editPrograme = function (programe, callback) {
            ProgrameModels.findById(programe.id, function (err, doc) {
                if (doc) {
                    doc.name = programe.name;
                    doc.isBlocked = programe.isBlocked;
                    doc.description = programe.description;
                    doc.duration = programe.duration;
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
                        "response_message": "Programe Not Found"
                    })
                }
            })
        },
        programe.statics.deletePrograme = function (programe, callback) {
            ProgrameModels.findById(programe.id, function (err, doc) {
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
                        "response_message": "Programe Not Found"
                    })
                }
            })
        },
        programe.statics.getPrograme = function (data, callback) {
            ProgrameModels.findById(data.id, function (err, programe) {
                if (!err) {
                    if (programe) {
                        callback({
                            "response_code": 2000,
                            "response_data": programe
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
        },
        programe.statics.getAllPrograme = function (params, callback) {
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
            ProgrameModels.paginate(query, {
                // select: 'name email phone city user_type',
                sort,
                page: page,
                limit: limit
            }, function (err, programs) {
                if (err) {
                    callback({
                        success: false,
                        response_code: 5002,
                        response_message: "Internal server error",
                        errors: err
                    });
                } else {
                    console.log('programs', programs);
                    callback({
                        success: true,
                        response_code: 2000,
                        response_message: "Programme list",
                        response_data: programs
                        //result: users
                    });
                }
            });
        }

    return programe;
}());

module.exports = ProgrameModels;