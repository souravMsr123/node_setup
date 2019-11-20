var express2 = require("express");
var Admin = require('../models/admin');
var adminService = require('../services/adminService');
var bodyParser = require('body-parser');
var config = require('../config');

var adminService = require('../services/adminService');
var mealService = require('../services/mealService');
var equipmentService = require('../services/equipmentService');
var muscleTargetService = require('../services/muscleTargetService');
var workOutTypeService = require('../services/workOutTypeService');
var programeService = require('../services/programeService');
var workOutService = require('../services/workOutService');
var feedService = require('../services/feedService');
var secretKey = config.secretKey;
var FeedsModel = require('../models/feed');
var ProgramsModel = require('../models/program');
var WorkOutsModel = require('../models/workout');
var path = require('path');

var fileUpload = require('express-fileupload');


var multer = require('multer')

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


module.exports = function () {
    // admin.use(upload());
    var admin = express2.Router();
    // admin.use(bodyParser.json());
    // admin.use(bodyParser.urlencoded({
    //     extended: true
    // }));
    //admin.use(fileUpload());


    // Feed Image Upload
    admin.post('/uploadFeedImage', multer({
        storage: storage1
    }).single('file'), function (req, res) {
        //console.log('request Object', req);
        // var feddId = req.body.id;
        var programeData = req.body;
        if (!programeData.id || typeof programeData.id === undefined) {
            res.send({
                response_code: 4000,
                response_message: "Please provide id"
            })
        } else {
            let image_url = `/uploads/profilepic/${req.file.filename}`;
            FeedsModel.findById(programeData.id, (err, feed) => {
                if (err) {
                    res.send({
                        response_code: 5000,
                        response_message: "Internal DB error",
                        response_data: {}
                    })
                }
                feed.image_url = image_url;
                feed.save((err, result) => {
                    if (err) {
                        res.send({
                            response_code: 5002,
                            response_message: "File not uploaded",
                            response_data: {}
                        })
                    }
                    res.send({
                        response_code: 2000,
                        response_message: "File uploaded",
                        response_data: result
                    })
                })
            })
        }
    });

    // Programe image upload
    admin.post('/uploadProgrameImage', multer({
        storage: storage1
    }).single('file'), function (req, res) {
        res.send(req.file)
        //console.log('request Object', req);
        var programeData = req.body;
        if (!programeData.id || typeof programeData.id === undefined) {
            res.send({
                response_code: 4000,
                response_message: "Please provide id"
            })
        } else {
            let image_url = `/uploads/profilepic/${req.file.filename}`;
            ProgramsModel.findById(programeData.id, (err, programe1) => {
                if (err) {
                    res.send({
                        response_code: 5000,
                        response_message: "Internal DB error",
                        response_data: {}
                    })
                }
                programe1.image_url = image_url;
                programe1.save((err, result) => {
                    if (err) {
                        res.send({
                            response_code: 5002,
                            response_message: "File not uploaded",
                            response_data: {}
                        })
                    }
                    res.send({
                        response_code: 2000,
                        response_message: "File uploaded",
                        response_data: result
                    })
                })
            })
        }



    });
    // WorkOut image upload
    admin.post('/uploadWorkoutImage', multer({
        storage: storage1

    }).array('files', 20), function (req, res) {
        // res.send(req.files)
        var workoutdata = req.body;
        let uploadedImage = req.files;
        if (!workoutdata.id || typeof workoutdata.id === undefined) {
            res.send({
                response_code: 4000,
                response_message: "Please provide id"
            })
        } else {
            var result = Object.keys(uploadedImage).map(function (key) {
                return uploadedImage[key];
            });
            let image_urls = [];
            result.forEach((file) => {
                let imageFile = file;
                let split = imageFile.mimetype.split("/");
                let timeStamp = Date.now();
                let programe = 'workout';
                let image_url = `/uploads/profilepic/${file.filename}`;
                console.log('file', file);

                image_urls.push({
                    value: image_url
                })
            })

            console.log('workoutdata', req.body);
            WorkOutsModel.findById(workoutdata.id, (err, work) => {
                if (err) {
                    res.send({
                        response_code: 5000,
                        message: 'Internal DB error'
                    })
                }
                image_urls.forEach((image) => {
                    work.image_url.push(image)
                })

                work.save((err, result) => {
                    if (err) {
                        res.send({
                            response_code: 5002,
                            response_message: 'File not uploaded',
                            response_data: err
                        })
                    }
                    res.send({
                        response_code: 2000,
                        message: 'File uploaded',
                        response_data: result
                    })
                });
            })
        }
    });


    admin.post('/adminSignup', function (req, res) {
        var adminData = req.body;
        //  console.log(adminData);
        adminService.adminSignup(req.body, function (response) {
            res.send(response);
        });
    });
    admin.post('/adminLogin', function (req, res) {
        adminService.adminLogin(req.body, function (loginRes) {
            res.send(loginRes);
        })
    });
    admin.post('/userList', function (req, res) {
        console.log(req.query);
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                adminService.userList(data, function (loginRes) {
                    // console.log(loginRes);
                    res.send(loginRes);
                })
            } else {
                res.send(authRes);
            }
        })
    });

    admin.post('/getUserDetails', function (req, res) {
        console.log(req.query);
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                adminService.userDetails(data, function (user) {
                    // console.log(loginRes);
                    res.send(user);
                })
            } else {
                res.send(authRes);
            }
        })
    });

    admin.post('/addUser', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                adminService.registerUser(req.body, function (response) {
                    res.send(response);
                });

            } else {
                res.send(authRes);
            }
        });
    });
    admin.post('/updateUserData', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                adminService.updateUserProfile(req.body, function (response) {
                    res.send(response);
                });
            } else {
                res.send(authRes);
            }
        });
    });

    // Meals Category Routes
    admin.post('/addMealCategory', function (req, res) {
        let data = req.body;
        let token = data.token;
        // res.send(token);
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.addMealCategory(data, function (mealCat) {
                    res.send(mealCat);
                })
            } else {
                res.send(authRes);
            }
        })
    });

    admin.post('/editMealCategory', function (req, res) {
        let data = req.body;
        let token = data.token;
        // res.send(token);
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.updateMealCategory(data, function (mealCat) {
                    res.send(mealCat);
                })
            } else {
                res.send(authRes);
            }
        })
    });
    admin.post('/deleteMealCategory', function (req, res) {
        let data = req.body;
        let token = data.token;
        // res.send(token);
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.deleteMealCategory(data, function (mealCat) {
                    res.send(mealCat);
                })
            } else {
                res.send(authRes);
            }
        })
    });
    admin.post('/getAllMealCategory', function (req, res) {
        let data = req.body;
        let token = data.token;
        // res.send(token);
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.getAllMealCategory(data, function (mealCat) {
                    res.send(mealCat);
                })
            } else {
                res.send(authRes);
            }
        })
    });
    admin.post('/getAllMealCategoryList', function (req, res) {
        let data = req.body;
        let token = data.token;
        // res.send(token);
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.getAllMealCategoryList(data, function (mealCat) {
                    res.send(mealCat);
                })
            } else {
                res.send(authRes);
            }
        })
    });
    admin.post('/getMealCategory', function (req, res) {
        let data = req.body;
        let token = data.token;
        // res.send(token);
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.getMealCategory(data, function (mealCat) {
                    res.send(mealCat);
                })
            } else {
                res.send(authRes);
            }
        })
    });
    // Equipment Routes
    admin.post('/addEquipment', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                equipmentService.addEquipment(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/editEquipment', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                equipmentService.updateEquipment(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/deleteEquipment', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                equipmentService.deleteEquipment(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getEquipment', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                equipmentService.getEquipment(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllEquipment', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                equipmentService.getAllEquipment(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllEquipmentList', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                equipmentService.getAllEquipmentList(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    // Muscle Target Routes
    admin.post('/addMuscleTarget', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                muscleTargetService.addMuscleTarget(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/editMuscleTarget', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                muscleTargetService.updateMuscleTarget(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/deleteMuscleTarget', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                muscleTargetService.deleteMuscleTarget(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getMuscleTarget', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                muscleTargetService.getMuscleTarget(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllMuscleTarget', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                muscleTargetService.getAllMuscleTarget(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllMuscleTargetList', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                muscleTargetService.getAllMuscleTargetList(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    // WorkOut Types Routes
    admin.post('/addWorkOutType', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutTypeService.addWorkOutType(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/editWorkOutTypet', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutTypeService.updateWorkOutType(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/deleteWorkOutType', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutTypeService.deleteWorkOutType(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getWorkOutType', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutTypeService.getWorkOutType(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllWorkOutType', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutTypeService.getAllWorkOutType(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/getAllWorkOutTypeList', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutTypeService.getAllWorkOutTypeList(data, function (mustar) {
                    res.send(mustar);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    // Meal Routes
    admin.post('/addMeal', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.addmeal(data, function (meal) {
                    res.send(meal);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/editMeal', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.editmeal(data, function (meal) {
                    res.send(meal);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/deleteMeal', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.deletemeal(data, function (meal) {
                    res.send(meal);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getMeal', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.getmeal(data, function (meal) {
                    res.send(meal);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllMeal', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                mealService.getallmeals(data, function (meal) {
                    res.send(meal);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    // Programe Routes
    admin.post('/addPrograme', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                programeService.addPrograme(data, function (Programe) {
                    res.send(Programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/editPrograme', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                programeService.updatePrograme(data, function (Programe) {
                    res.send(Programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/deletePrograme', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                programeService.deletePrograme(data, function (Programe) {
                    res.send(Programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/getAllPrograme', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                programeService.getAllPrograme(data, function (Programe) {
                    res.send(Programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/getPrograme', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                programeService.getPrograme(data, function (Programe) {
                    res.send(Programe);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    // Workout Routes

    admin.post('/addWorkOut', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutService.addWorkOut(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/editWorkOut', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutService.updateWorkOut(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/deleteWorkOut', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutService.deleteWorkOut(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getAllWorkOut', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutService.getAllWorkOut(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    admin.post('/getWorkOut', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                workOutService.getWorkOut(data, function (WorkOut) {
                    res.send(WorkOut);
                })
            } else {
                res.send(authRes);
            }
        })
    })
    // Feed management Routes
    admin.post('/addfeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                feedService.addFeed(data, function (feed) {
                    res.send(feed);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/editfeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                feedService.updateFeed(data, function (feed) {
                    res.send(feed);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/deleteFeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                feedService.deleteFeed(data, function (feed) {
                    res.send(feed);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/getFeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                feedService.getFeed(data, function (feed) {
                    res.send(feed);
                })
            } else {
                res.send(authRes);
            }
        })
    })

    admin.post('/getAllFeed', function (req, res) {
        let data = req.body;
        let token = data.token;
        adminService.jwtAuthVerification(token, function (authRes) {
            if (authRes.response_code === 2000) {
                feedService.getAllFeed(data, function (feed) {
                    res.send(feed);
                })
            } else {
                res.send(authRes);
            }
        })
    })



    return admin;
}