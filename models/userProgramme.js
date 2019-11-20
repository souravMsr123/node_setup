var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
var ObjectId1 = require('mongoose').Types.ObjectId;

var UserProgrammeModels = mongoose.model("UserProgramme", function () {

    var userProgramme = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        programme_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Programe',
            required: true
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        }

    }, {
        timestamps: true
    });

    userProgramme.statics.joinProgramme = (data, callback) => {
            UserProgrammeModels.findOne({
                user_id: data.user_id,
                programme_id: data.programme_id
            }, (err, found) => {
                if (err) {
                    console.log('error => ', err);
                    callback({
                        response_code: 5005,
                        response_message: "Internal DB error",
                        response_data: err
                    })
                }
                if (found) {
                    if (found.status === 'ACTIVE') {
                        console.log('found', found);
                        callback({
                            response_code: 2000,
                            response_message: "user has already joined this programme",
                            response_data: {}
                        })
                    } else {
                        UserProgrammeModels.findOneAndUpdate({
                            user_id: data.user_id,
                            programme_id: data.programme_id
                        }, {
                            $set: {
                                status: 'ACTIVE'
                            }
                        }, {
                            new: true
                        }).exec((err, result) => {
                            if (err) {
                                callback({
                                    response_code: 5005,
                                    response_message: "INTERNAL DB ERROR",
                                    response_data: err
                                })
                            }
                            callback({
                                response_code: 2000,
                                response_message: "You have successfully joined this programme",
                                response_data: result
                            })
                        });

                    }
                } else {
                    data._id = new ObjectId;
                    new UserProgrammeModels(data).save(function (err, response_data) {
                        if (!err) {
                            // console.log("[registered User Weight]", response_data);
                            callback({
                                response_code: 2000,
                                response_message: "You have successfully joined this programme",
                                response_data: response_data

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
                }
            })

        },
        userProgramme.statics.unsubscribeProgramme = (data, callback) => {
            UserProgrammeModels.findOne({
                user_id: data.user_id,
                programme_id: data.programme_id
            }, (err, found) => {
                if (err) {
                    console.log('error => ', err);
                    callback({
                        response_code: 5005,
                        response_message: "Internal DB error",
                        response_data: err
                    })
                }
                if (!found) {
                    callback({
                        response_code: 2000,
                        response_message: "Currently user has not joined this programme",
                        response_data: {}
                    })
                } else {
                    if (found.status === 'INACTIVE') {
                        callback({
                            response_code: 2000,
                            response_message: "Already unsubscribed from this programme",
                            response_data: found
                        })
                    } else {
                        UserProgrammeModels.findOneAndUpdate({
                            user_id: data.user_id,
                            programme_id: data.programme_id
                        }, {
                            $set: {
                                status: 'INACTIVE'
                            }
                        }, {
                            new: true
                        }).exec((err, result) => {
                            if (err) {
                                callback({
                                    response_code: 5005,
                                    response_message: "INTERNAL DB ERROR",
                                    response_data: err
                                })
                            }
                            callback({
                                response_code: 2000,
                                response_message: "You have unsubscribed from this programe successfully",
                                response_data: result
                            })
                        });
                    }
                }
            })
        },
        userProgramme.statics.getAllProgrammes = (data, callback) => {
            UserProgrammeModels.find({
                user_id: data.user_id,
                status: 'ACTIVE'
            }, (err, programes) => {
                if (err) {
                    callback({
                        response_code: 5005,
                        response_message: "Internal DB error",
                        response_data: err
                    })
                }

                if (programes) {
                    callback({
                        response_code: 2000,
                        response_data: programes
                    })
                } else {
                    callback({
                        response_code: 2000,
                        response_message: "No preogrammes with this user",
                        response_data: {}
                    })
                }

            }).populate('programme_id').exec();
        }





    return userProgramme;

}());

module.exports = UserProgrammeModels;