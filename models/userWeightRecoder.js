var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
var ObjectId1 = require('mongoose').Types.ObjectId;
var UserWeightRecorderModels = mongoose.model("UserWeightRecorder", function () {

    var userWeight = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false
        },
        month: {
            type: Number,
            required: true
        },
        days: [{
            emoji: {
                type: String,
                required: false
            },
            body_weight: {
                weight_type: {
                    type: String,
                    required: false
                },
                weight_value: {
                    type: Number,
                    required: false
                }
            },
            record_date: {
                type: String,
                required: true
            }
        }],
        goal: {
            goal_weight: {
                weight_type: {
                    type: String,
                    required: false
                },
                weight_value: {
                    type: Number,
                    required: false
                }
            },
            set_goal_date: {
                type: String,
                required: false
            }
        }
    }, {
        timestamps: true
    });
    userWeight.statics.newUserWeight = function (data, callback) {
            console.log('request data', data);

            UserWeightRecorderModels.findOne({
                user_id: data.user_id,
                month: data.month
            }, (err, found) => {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": err
                    })
                }
                if (found) {
                    console.log('record found', found);

                    found.days.push(data.days);
                    found.save();

                    console.log('after edit', found);
                    callback({
                        "response_code": 2000,
                        "response_message": "New record saved",
                        "response_data": {
                            data: [found]
                        }
                    });
                } else {
                    data._id = new ObjectId;
                    new UserWeightRecorderModels(data).save(function (err, response_data) {
                        if (!err) {
                            console.log("[registered User Weight]", response_data);
                            callback({
                                "response_code": 2000,
                                "response_data": {
                                    data: [{
                                        response_data
                                    }]
                                },
                                "response_message": "New record saved",
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
        userWeight.statics.weightCalendarFilter = function (data, callback) {

            var startdate = moment(data.record_date * 1000).startOf('month').unix();
            var endDate = moment().unix();

            console.log('startdate', startdate, 'endDate', endDate);

            UserWeightRecorderModels.aggregate([{
                    $match: {
                        "days.record_date": {
                            $gte: startdate.toString(),
                            $lte: endDate.toString()
                        },
                        user_id: ObjectId1(data.user_id)
                    },

                },
                {
                    $unwind: "$days"
                },
                {
                    $match: {
                        "days.record_date": {
                            $gte: startdate.toString(),
                            $lte: endDate.toString()
                        }
                        // user_id: data.user_id
                    }
                },
                {
                    "$project": {
                        "days": 1
                    }
                }
            ], (err, weights) => {


                if (err) {
                    callback({
                        response_code: 5000,
                        response_data: err
                    })
                }
                var daysArray = [];
                weights.forEach(day => {
                    daysArray.push(day.days)
                })
                callback({
                    response_code: 2000,
                    response_data: {
                        data: [{
                            from: moment(startdate * 1000).format('MMMM Do YYYY'),
                            to: moment(endDate * 1000).format('MMMM Do YYYY'),
                            days: daysArray
                        }]
                    }
                });

            })



        },



        userWeight.statics.updateUserWeightByDate = function (data, callback) {
            UserWeightRecorderModels.findOneAndUpdate({
                user_id: data.user_id,
                "days": {
                    $elemMatch: {
                        record_date: data.record_date
                    }
                }
            }, {
                $set: {
                    'days.$.emoji': data.days.emoji,
                    'days.$.record_date': data.days.record_date,
                    'days.$.body_weight.weight_type': data.days.body_weight.weight_type,
                    'days.$.body_weight.weight_value': data.days.body_weight.weight_value
                }
            }, {
                new: true
            }).exec((err, result) => {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": err
                    })
                }
                callback({
                    "response_code": 2000,
                    "response_message": "Weight updated successfully",
                    "response_data": {
                        data: [result]
                    }
                })
            });
        }
    return userWeight;

}());

module.exports = UserWeightRecorderModels;