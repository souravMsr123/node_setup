'use strict';
var fs = require('fs');
var express2 = require("express");
var apiService = require('../services/apiService');
var bodyParser = require('body-parser');
var config = require('../config');
var moment = require('moment');
//var fileUpload = require('express-fileupload');
var multer = require('multer');
//var ImageUpload = multer({ dest: './public/uploads/profilepic'});
var UserModels = require('../models/user');
var FeedsModel = require('../models/feed');
var TDEEModels = require('../models/tdeeCalculation');
var UserProgrammesModels = require('../models/userProgramme');
var UserWeightRecorderModels = require('../models/userWeightRecoder');
var ObjectId = require('mongoose').Types.ObjectId;
var secretKey = config.secretKey;

var adminService = require('../services/adminService');
var workOutTypeService = require('../services/workOutTypeService');
var workOutService = require('../services/workOutService');
var programService = require('../services/programeService');
var mealService = require('../services/mealService');
var feedService = require('../services/feedService');
var async = require("async");

var WorkOutTypeModels = require('../models/workOutType');
var EquipmentModel = require('../models/equipment');
var MuscleTargetModels = require('../models/muscleTarget');
var WorkOutModel = require('../models/workout');
var ProgrammeModel = require('../models/program');
var MealModel = require('../models/meal');
// Multer Config
//var multer = require('multer')

var storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/profilepic/')
    },
    filename: function (req, file, cb) {
        let split = file.mimetype.split("/");
        let timeStamp = Date.now();
        console.log('files => ', file);

        cb(null, `${file.fieldname}_${timeStamp}.${split[1]}`)
    }
})


module.exports = function (app, express) {

    var api = express2.Router();

    // api.use(bodyParser.json()); api.use(bodyParser.urlencoded({     extended:
    // false })); api.use(fileUpload());
    api.post('/getGoal', function (req, res) {
        let data = req.body;
        if (!data.user_id || typeof data.user_id === undefined) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide user Id'
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    UserWeightRecorderModels.findOne({
                        user_id: data.user_id
                    }, {
                        goal: 1
                    }, (err, user) => {
                        if (err) {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        } else {
                            if (user) {
                                // console.log('goal', typeof user.goal.goal_weight);

                                res.send({
                                    "response_code": 2000,
                                    "response_message": "User goal",
                                    "response_data": user.goal
                                })
                            } else {
                                res.send({
                                    "response_code": 2000,
                                    "response_message": "No goal set",
                                    "response_data": null
                                })
                            }
                        }
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })
    api.post('/setGoal', function (req, res) {
        let data = req.body;
        if (!data.user_id || typeof data.user_id === undefined) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide user Id'
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    UserWeightRecorderModels.findOne({
                        user_id: data.user_id
                    }, (err, user) => {
                        if (err) {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        } else {
                            if (user) {
                                user.goal = data.goal;
                                user.save();
                                res.send({
                                    "response_code": 2000,
                                    "response_message": "User Goal set",
                                    "response_data": {
                                        goal: user.goal,
                                        user_id: user.user_id
                                    }
                                })
                            } else {
                                res.send({
                                    "response_code": 2000,
                                    "response_message": "User not found",
                                    "response_data": null
                                })
                            }
                        }
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })
    api.post('/fetchWeightData', function (req, res) {
        let data = req.body;
        if (!data.user_id || typeof data.user_id === undefined) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide user Id'
            })
        }
        if (!data.authtoken || typeof data.authtoken === undefined) {
            res.send({
                response_code: 5002,
                message: 'Please provide authtoken',

            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    UserWeightRecorderModels.findOne({
                        "days.record_date": data.record_date,
                        user_id: data.user_id
                    }, {
                        "days": {
                            $elemMatch: {
                                record_date: data.record_date
                            }
                        },
                    }, (err, user) => {
                        if (err) {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        } else {
                            if (user) {
                                res.send({
                                    "response_code": 2000,
                                    "response_message": "User Weight record",
                                    "response_data": {
                                        "id": user.id,
                                        "days": user.days[0]

                                    }
                                })
                            } else {
                                res.send({
                                    "response_code": 2000,
                                    "response_message": "User Weight Not Found",
                                    "response_data": null
                                })
                            }
                        }
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })
    api.post('/uploadTest', (req, res) => {
        res.json(req.files);
    })
    api.post('/userProgressTracker', async function (req, res) {
        let data = req.body;
        var filtered_data = [];
        var start_point;
        var end_point = data.from_date;
        if (!data.user_id) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide user Id'
            })
        } else {
            apiService.jwtAuthVerification(data, async function (authRes) {
                if (authRes.response_code === 2000) {
                    var week_days_array = [];
                    if (data.filter_by === 'weekly') { // week data filter
                        end_point = data.from_date;
                        for (let i = 1; i < 5; i++) {
                            // var exm = [1, 2, 3, 4]
                            // await async.each(exm, async (item, cb) => {

                            start_point = end_point - 518400;

                            await new Promise(async (resolve, reject) => {
                                await UserWeightRecorderModels.aggregate([{
                                        $match: {
                                            "days.record_date": {
                                                $gte: start_point.toString(),
                                                $lte: end_point.toString()
                                            },
                                            user_id: ObjectId(data.user_id)
                                        },

                                    },
                                    {
                                        $unwind: "$days"
                                    },
                                    {
                                        $match: {
                                            "days.record_date": {
                                                $gte: start_point.toString(),
                                                $lte: end_point.toString()
                                            }
                                            // user_id: data.user_id
                                        }
                                    },
                                    {
                                        "$project": {
                                            "days": 1,
                                            "goal": 1
                                        }
                                    },
                                    {
                                        $sort: {
                                            "days.record_date": 1
                                        }
                                    }
                                ], async (err, weights) => {


                                    if (err) {
                                        res.send({
                                            response_code: 5000,
                                            response_data: err
                                        })
                                    }
                                    if (weights) {
                                        // console.log('weights => ', weights);


                                        // var weights_array = weights.map(function (weight, index) {
                                        //     return {
                                        //         key: (index + 1).toString(),
                                        //         days: weight.days
                                        //     }
                                        // });
                                        var weights_array = [];
                                        weights.forEach(day => {

                                            weights_array.push(day.days)

                                        })
                                        week_days_array.push({
                                            week_number: i,
                                            from: moment(start_point * 1000).format('MMMM Do YYYY'),
                                            to: moment(end_point * 1000).format('MMMM Do YYYY'),
                                            days: weights_array
                                        });
                                        resolve(1);
                                    }

                                })
                            })
                            end_point = start_point - 86400;

                        }

                        res.send({
                            response_code: 2000,
                            response_data: {
                                'data': week_days_array,
                                'count': week_days_array.length
                            }
                        })
                    }
                    if (data.filter_by === 'monthly') { // monthly data filter
                        var data1;
                        var month_data_array = [];
                        var month_end_point = data.from_date;
                        for (let i = 1; i < 5; i++) {

                            var month_start_point = month_end_point - (86400 * 31);
                            await new Promise(async (resolve, reject) => {
                                await UserWeightRecorderModels.aggregate([{
                                        $match: {
                                            "days.record_date": {
                                                $gte: month_start_point.toString(),
                                                $lte: month_end_point.toString()
                                            },
                                            user_id: ObjectId(data.user_id)
                                        },

                                    },
                                    {
                                        $unwind: "$days"
                                    },
                                    {
                                        $match: {
                                            "days.record_date": {
                                                $gte: month_start_point.toString(),
                                                $lte: month_end_point.toString()
                                            }
                                            // user_id: data.user_id
                                        }
                                    },
                                    {
                                        "$project": {
                                            "days": 1,
                                            "goal": 1
                                        }
                                    },
                                    {
                                        $sort: {
                                            "days.record_date": 1
                                        }
                                    }
                                ], async (err, weights) => {


                                    if (err) {
                                        res.send({
                                            response_code: 5000,
                                            response_data: err
                                        })
                                    }
                                    if (weights) {
                                        //console.log('weights => ', weights);


                                        var weights_array = [];
                                        weights.forEach(day => {

                                            weights_array.push(day.days)

                                        })
                                        month_data_array.push({
                                            month_number: i,
                                            from: moment(month_start_point * 1000).format('MMMM Do YYYY'),
                                            to: moment(month_end_point * 1000).format('MMMM Do YYYY'),
                                            days: weights_array,
                                        });
                                        resolve(1);
                                    }

                                })
                            })

                            month_end_point = month_start_point - 86400;

                        }


                        res.send({
                            response_code: 2000,
                            response_data: {
                                'data': month_data_array,
                                'count': month_data_array.length
                            }

                        })
                    }
                    if (data.filter_by === 'quaterly') { // quaterly data filter
                        var quaterly_data_array = [];
                        var quaterly_end_point = data.from_date;
                        for (let i = 1; i < 5; i++) {

                            var quaterly_start_point = quaterly_end_point - (86400 * 31 * 3);

                            await new Promise(async (resolve, reject) => {
                                await UserWeightRecorderModels.aggregate([{
                                        $match: {
                                            "days.record_date": {
                                                $gte: quaterly_start_point.toString(),
                                                $lte: quaterly_end_point.toString()
                                            },
                                            user_id: ObjectId(data.user_id)
                                        },

                                    },
                                    {
                                        $unwind: "$days"
                                    },
                                    {
                                        $match: {
                                            "days.record_date": {
                                                $gte: quaterly_start_point.toString(),
                                                $lte: quaterly_end_point.toString()
                                            }
                                            // user_id: data.user_id
                                        }
                                    },
                                    {
                                        "$project": {
                                            "days": 1,
                                            "goal": 1
                                        }
                                    },
                                    {
                                        $sort: {
                                            "days.record_date": 1
                                        }
                                    }
                                ], async (err, weights) => {


                                    if (err) {
                                        res.send({
                                            response_code: 5000,
                                            response_data: err
                                        })
                                    }
                                    if (weights) {

                                        // var weights_array = weights.map(function (weight, index) {
                                        //     return {
                                        //         key: (index + 1).toString(),
                                        //         days: weight.days
                                        //     }
                                        // });

                                        var weights_array = [];
                                        weights.forEach(day => {

                                            weights_array.push(day.days)

                                        });
                                        quaterly_data_array.push({
                                            quater: i,
                                            from: moment(quaterly_start_point * 1000).format('MMMM Do YYYY'),
                                            to: moment(quaterly_end_point * 1000).format('MMMM Do YYYY'),
                                            days: weights_array
                                        });
                                        resolve(1);
                                    }

                                })
                            })
                            console.log('quaterly_start_point =>', moment(quaterly_start_point * 1000).format('MMMM Do YYYY'), 'quaterly_end_point =>', moment(quaterly_end_point * 1000).format('MMMM Do YYYY'));
                            quaterly_end_point = quaterly_start_point - 86400;

                        }


                        res.send({
                            response_code: 2000,
                            response_data: {
                                'data': quaterly_data_array,
                                "count": quaterly_data_array.length
                            }

                        })
                    }

                    if (data.filter_by === 'anually') { // monthly data filter
                        var data1;
                        var month_data_array = [];
                        var month_end_point = data.from_date;
                        for (let i = 1; i < 13; i++) {

                            var month_start_point = month_end_point - (86400 * 31);
                            await new Promise(async (resolve, reject) => {
                                await UserWeightRecorderModels.aggregate([{
                                        $match: {
                                            "days.record_date": {
                                                $gte: month_start_point.toString(),
                                                $lte: month_end_point.toString()
                                            },
                                            user_id: ObjectId(data.user_id)
                                        },

                                    },
                                    {
                                        $unwind: "$days"
                                    },
                                    {
                                        $match: {
                                            "days.record_date": {
                                                $gte: month_start_point.toString(),
                                                $lte: month_end_point.toString()
                                            }
                                            // user_id: data.user_id
                                        }
                                    },
                                    {
                                        "$project": {
                                            "days": 1,
                                            "goal": 1
                                        }
                                    },
                                    {
                                        $sort: {
                                            "days.record_date": 1
                                        }
                                    }
                                ], async (err, weights) => {


                                    if (err) {
                                        res.send({
                                            response_code: 5000,
                                            response_data: err
                                        })
                                    }
                                    if (weights) {
                                        //console.log('weights => ', weights);
                                        // var weights_array = weights.map(function (weight, index) {
                                        //     return {
                                        //         key: (index + 1).toString(),
                                        //         days: weight.days
                                        //     }
                                        // });

                                        var weights_array = [];
                                        weights.forEach(day => {

                                            weights_array.push(day.days)

                                        });
                                        month_data_array.push({
                                            month_number: i,
                                            from: moment(month_start_point * 1000).format('MMMM Do YYYY'),
                                            to: moment(month_end_point * 1000).format('MMMM Do YYYY'),
                                            days: weights_array,
                                        });
                                        resolve(1);
                                    }

                                })
                            })

                            month_end_point = month_start_point - 86400;

                        }


                        res.send({
                            response_code: 2000,
                            response_data: {
                                'data': month_data_array,
                                'count': month_data_array.length
                            }

                        })
                    }
                } else {
                    res.send(authRes);
                }
            })
        }

    })
    api.post('/signupUser', function (req, res) {
        apiService.signupUser(req.body, function (response) {
            res.send(response);
        });
    });

    api.post('/updateProfile', function (req, res) {
        var dataUser = req.body;
        //var dataUser = userData;
        if (!dataUser.user_id || typeof dataUser.user_id === undefined) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide user Id',

            })
        }
        if (!dataUser.authtoken || typeof dataUser.authtoken === undefined) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide authtoken',

            })
        } else {
            apiService.jwtAuthVerification(dataUser, async function (authRes) {
                if (authRes.response_code === 2000) {
                    UserModels.updateUserProfile(dataUser, function (updateRes) {
                        res.send(updateRes);
                        // console.log("2222", updateRes);
                    })
                } else {
                    res.send(authRes);
                }
            });

        }
    });

    api.post('/uploadUserImage', multer({
        storage: storage1
    }).single('file'), function (req, res) {
        var dataUser = req.body;
        console.log(req.files, req.body.user_id);
        if (!dataUser.user_id || typeof dataUser.user_id === undefined) {
            res.send({
                response_code: 5002,
                response_message: 'Please provide user Id',
                data: dataUser,
                replace: 1
            })
        } else {
            if (req.file) {
                let image_url = `/uploads/profilepic/${req.file.filename}`;
                let server_url = 'https://nodeserver.brainiuminfotech.com:1110';
                // res.send({user:userData});
                dataUser.image_url = server_url + image_url;
                UserModels.updateUserProfile(dataUser, function (updateRes) {
                    res.send(updateRes);
                    // console.log("1111", updateRes);
                })

            }
        }

    });
    api.post('/login', function (req, res) {
        console.log('login', req);
        apiService.login(req.body, function (loginRes) {
            res.send(loginRes);
        })
    });
    api.post('/logout', function (req, res) {
        apiService.logout(req.body, function (loginRes) {
            res.send(loginRes);
        })
    });
    api.post('/socialSignup', function (req, res) {
        apiService.socialSignup(req.body, function (response) {
            res.send(response);
        });
    });

    api.post('/changePassword', function (req, res) {
        apiService.changePassword(req.body, function (passwordRes) {
            res.send(passwordRes);
        })
    });
    api.post('/forgotPassword', function (req, res) {
        apiService.forgotPassword(req.body, function (passwordRes) {
            res.send(passwordRes);
        })
    });
    api.post('/resendOTP', function (req, res) {
        console.log('request', req.body);
        apiService.resendOTP(req.body, function (passwordRes) {
            res.send(passwordRes);
        })
    });
    api.post('/verifyOTP', function (req, res) {
        apiService.verifyOTP(req.body, function (passwordRes) {
            res.send(passwordRes);
        })
    });
    api.post('/setPassword', function (req, res) {
        apiService.setPassword(req.body, function (response) {
            res.send(response);
        });
    });
    api.post('/changeDeviceToken', function (req, res) {
        apiService.updateDeviceToken(req.body, function (passwordRes) {
            res.send(passwordRes);
        })
    });
    api.post('/userProfile', function (req, res) {
        apiService.userProfile(req.body, function (userData) {
            res.send(userData);
        })
    });
    // Workout Api
    api.post('/getAllWorkOut', function (req, res) {
        let data = req.body;
        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                WorkOutModel.find({}, (err, docs) => {
                        if (err) {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        }
                        res.send({
                            "response_code": 2000,
                            "response_message": "WorkOut List",
                            "response_data": docs
                        })
                    }).populate('workout_type')
                    .populate('muscle_target')
                    .populate('equipment')
            } else {
                res.send(authRes);
            }
        })
    });
    api.post('/getWorkOut', function (req, res) {
        let data = req.body;
        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutService.getWorkOut(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    // Programs Api
    api.post('/getAllPrograme', function (req, res) {
        let data = req.body;
        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {

                ProgrammeModel.find({}, (err, docs) => {
                    if (err) {
                        res.send({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    }
                    res.send({
                        "response_code": 2000,
                        "response_message": "WorkOut List",
                        "response_data": docs
                    })
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/getPrograme', function (req, res) {
        let data = req.body;
        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                programService.getPrograme(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    });
    api.post('/getMealCategoryArray', function (req, res) {
        let data = req.body;
        console.log('getMealCategoryArray', data);

        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.getMealCategoryArray(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    // Meals Api
    api.post('/getAllMeal', function (req, res) {
        let data = req.body;
        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {

                MealModel.find({}, (err, docs) => {
                    if (err) {
                        res.send({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    }
                    res.send({
                        "response_code": 2000,
                        "response_message": "Meal List",
                        "response_data": docs
                    })
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/getMeal', function (req, res) {
        let data = req.body;
        // let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {

            if (authRes.response_code === 2000) {
                mealService.getmeal(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    // Filtering Datas Api

    api.post('/getMealBy', function (req, res) {
        let data = req.body;
        // console.log(req); res.send(req.body);
        apiService.jwtAuthVerification(data, function (authRes) {
            console.log('Apiservice', authRes);
            if (authRes.response_code === 2000) {
                mealService.getMealBy(data, function (meals) {
                    res.send(meals);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    // TDEE Calculation Data
    api.post('/storeTdeeData', function (req, res) {
        let data = req.body;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                TDEEModels.newTDEE(data, function (tdee) {
                    res.send(tdee);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/storeUserWeight', function (req, res) {
        let data = req.body;
        console.log(data);

        if (!data.user_id) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide user_id"
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    UserWeightRecorderModels.newUserWeight(data, function (weight) {
                        res.send(weight);
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })

    api.post('/weightCalendarFilter', function (req, res) {
        // Request Params 
        // user_id
        // authtoken
        // month
        // select
        // number of months
        let data = req.body;
        if (!data.user_id) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide user_id"
            })
        }
        if (!data.record_date) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide record date"
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    UserWeightRecorderModels.weightCalendarFilter(data, function (weight) {
                        res.send(weight);
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })

    api.post('/updateWeightByDate', function (req, res) {
        let data = req.body;
        console.log('dta => ', data);

        if (!data.user_id) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide user_id"
            })
        }
        if (!data.record_date) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide record_date"
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    UserWeightRecorderModels.updateUserWeightByDate(data, function (weight) {
                        res.send(weight);
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })

    // Workout Type filter options 
    api.post('/getWorkOutTypesOptions', (req, res) => {
        let data = req.body;
        if (!data.authtoken) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide authtoken"
            })
        }
        if (!data.user_id) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide user_id"
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    WorkOutTypeModels.find({}, {
                        name: 1
                    }, function (err, workouttype) {
                        if (!err) {
                            res.send({
                                "response_code": 2000,
                                "response_data": workouttype
                            })
                        } else {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        }
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })


    // Equipments Type filter options 
    api.post('/getEquipmentsOptions', (req, res) => {
        let data = req.body;
        if (!data.authtoken) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide authtoken"
            })
        }
        if (!data.user_id) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide user_id"
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    EquipmentModel.find({}, {
                        name: 1
                    }, function (err, equipment) {
                        if (!err) {
                            res.send({
                                "response_code": 2000,
                                "response_data": equipment
                            })
                        } else {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        }
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })

    // Muscle Targets Type filter options 
    api.post('/getMuscleTargetsOptions', (req, res) => {
        let data = req.body;
        if (!data.authtoken) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide authtoken"
            })
        }
        if (!data.user_id) {
            res.send({
                "response_code": 5002,
                "response_message": "please provide user_id"
            })
        } else {
            apiService.jwtAuthVerification(data, function (authRes) {
                if (authRes.response_code === 2000) {
                    MuscleTargetModels.find({}, {
                        name: 1
                    }, function (err, muscletarget) {
                        if (!err) {
                            res.send({
                                "response_code": 2000,
                                "response_data": muscletarget
                            })
                        } else {
                            res.send({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            })
                        }
                    })
                } else {
                    res.send(authRes);
                }
            })
        }
    })


    api.post('/getAllFeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                FeedsModel.find({}, (err, docs) => {
                    if (err) {
                        res.send({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    }
                    res.send({
                        "response_code": 2000,
                        "response_message": "Feed List",
                        "response_data": docs
                    })
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/getFeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                feedService.getFeed(data, function (feed) {
                    res.send(feed);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/joinProgramme', (req, res) => {
        let data = req.body;
        apiService.jwtAuthVerification(data, (authRes) => {
            if (authRes.response_code === 2000) {
                UserProgrammesModels.joinProgramme(data, function (programe) {
                    res.send(programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/unsubscribeProgramme', (req, res) => {
        let data = req.body;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                UserProgrammesModels.unsubscribeProgramme(data, function (programe) {
                    res.send(programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/getUserProgrames', (req, res) => {
        let data = req.body;
        apiService.jwtAuthVerification(data, function (authRes) {
            if (authRes.response_code === 2000) {
                UserProgrammesModels.getAllProgrammes(data, function (programe) {
                    res.send(programe);
                })

            } else {
                res.send(authRes);
            }
        })
    })

    api.post('/dashboardApi', async (req, res) => {
        console.log(',kjhklf');
        let data = req.body;

        await apiService.jwtAuthVerification(data, async function (authRes) {
            var responseArray = [];
            if (authRes.response_code === 2000) {
                //FeedsModel
                await UserWeightRecorderModels.find({
                    user_id: data.user_id
                }, async (err, firstrecord) => {


                    //moment.max
                    responseArray.push({
                        first: firstrecord
                    })
                }).sort({
                    _id: 1
                }).limit(1);



                await UserWeightRecorderModels.find({
                    user_id: data.user_id
                }, async (err, lastrecord) => {
                    console.log('lastrecord', lastrecord);
                    responseArray.push({
                        last: lastrecord
                    })
                }).sort({
                    _id: -1
                }).limit(1);



                await FeedsModel.find({}, async (err, lastThree) => {
                    console.log('lastThree', lastThree);
                    responseArray.push({
                        feeds: lastThree
                    })
                }).sort({
                    _id: -1
                }).limit(3);



                res.send({
                    response_code: 2000,
                    response_message: "Dashboard data",
                    response_data: responseArray
                });


            } else {
                res.send(authRes);
            }
        })
    })






    return api;
}