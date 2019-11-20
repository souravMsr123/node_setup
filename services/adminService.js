var express = require("express");
var AdminModels = require('../models/admin');
var UserModels = require('../models/user');
var config = require('../config');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var secretKey = config.secretKey;
var async = require("async");
var mongo = require('mongodb');
var crypto = require('crypto');
var sha1 = require('node-sha1');
var mailProperty = require('../modules/sendMail');
var ObjectID = mongo.ObjectID;
var baseUrl = config.baseUrl;
//var AWS = require('aws-sdk');
//AWS.config.update({region: 'us-east-2',accessKeyId: 'AKIAJXV4XBAIY453GUMA',secretAccessKey: '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'});

//AWS.config.update({region: 'us-east-1',accessKeyId: 'AKIAIUAWYLXXOWUUHVIA',secretAccessKey: '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'});
var adminService = {
    jwtAuthVerification: (token, callback) => {
        //  console.log(token);
        async.waterfall([
            function (nextCb) {
                if (token == null || token == undefined) {
                    nextCb({
                        success: false,
                        response_code: 5002,
                        response_message: "No token provided."
                    });
                } else {
                    nextCb(null, {
                        response_code: 2000
                    })
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    jwt.verify(token, secretKey, function (err, decoded) {
                        // console.log(err);
                        //console.log(decoded);
                        if (err) {
                            nextCb(null, {
                                success: false,
                                response_code: 4002,
                                response_message: "Session timeout! Please login again.",
                                token: null
                            });
                        }
                        if (!err) {
                            nextCb(null, {
                                success: true,
                                response_code: 2000,
                                response_message: "Authenticate successfully.",
                                response_data: decoded
                            });
                        }
                    });
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "success": false,
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (content.response_code === 5005) {
                callback(content);
            }
            if (content.response_code === 4002) {
                callback(content);
            }
            if (content.response_code === 2000) {
                callback(content);
            }
        });
    },
    adminSignup: function (adminData, callback) {
        async.waterfall([
            function (nextcb) { //checking email existance
                // var cError1 = "";
                AdminModels.findOne({
                    email: adminData.email
                }, function (err, admindet) {
                    if (err)
                        nextcb(err);
                    else {
                        if (admindet) {
                            // cError1 =;
                            nextcb(null, {
                                "response_code": 5000,
                                "response_message": "Email already taken",
                                "response_data": admindet
                            });
                        } else {
                            nextcb(null, {
                                "response_code": 2000
                            });

                        }
                    }
                });
            },
            function (cError1, nextcb) { //updating admin's data

                if (cError1.response_code === 5000) {
                    console.log(cError1);
                    nextcb(null, cError1);
                }
                if (cError1.response_code === 2000) {
                    adminData._id = new ObjectID;
                    var token = jwt.sign({
                        email: adminData.email
                    }, secretKey, {
                        //  expiresIn:'20m' // expires in 1 hours
                    });
                    // adminData.authtoken = crypto.randomBytes(32).toString('hex');
                    adminData.authtoken = token;
                    AdminModels.registerUser(adminData, function (signUpRes) {
                        //nextCb(null, signUpRes); 
                        nextcb(null, signUpRes);
                    })
                    //   var admin = new Admin(adminData);
                    //   admin.save(function(err){
                    //       if(err){
                    //           nextcb(err);
                    //       } else {
                    //           nextcb(null, cError1);
                    //       }
                    //   });
                }
            }

        ], function (err, content) {

            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            } else {
                //console.log(content);
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "Admin saved successfully",
                        "response_data": {
                            "authtoken": content.response_data.authtoken,
                            "profile_details": {
                                "rating": content.response_data.rating,
                                "user_id": content.response_data._id,
                                "name": content.response_data.name,
                                "dob": content.response_data.dob,
                                "email": content.response_data.email,
                                "profile_pic": content.response_data.image_url ? content.response_data.image_url : '',
                                "mobile": content.response_data.mobile
                            }
                        }
                    })
                }
                if (content.response_code === 5000) {
                    callback(content);
                }
            }
        });
    },
    adminLogin: (loginData, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!loginData.email || typeof loginData.email === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide email",
                        "response_data": {}
                    });
                } else if (!loginData.password || typeof loginData.password === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide password",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {
                        "response_code": 2000
                    });
                }

            },
            function (arg1, nextCb) {
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
                if (arg1.response_code === 2000) {
                    //console.log(loginData);
                    // var token = jwt.sign({ email: loginData.email }, secretKey, {
                    //       expiresIn:'1h' // expires in 1 hours
                    //     });
                    var token = jwt.sign({
                        email: loginData.email
                    }, secretKey, {
                        expiresIn: '12h'
                    });
                    console.log(token);
                    loginData.authtoken = token;
                    AdminModels.login(loginData, function (loginInfo) {
                        loginInfo.token = token;
                        nextCb(null, loginInfo);
                    })
                }
            },
            function (arg2, nextCb) {
                if (arg2.response_code === 5002) {
                    nextCb(null, arg2);
                }
                if (arg2.response_code === 4001) {
                    nextCb(null, arg2);
                }
                if (arg2.response_code === 5000) {
                    nextCb(null, arg2);
                }
                if (arg2.response_code === 2000) {
                    if (arg2.profileRes) {

                        var loginInfo = {
                            "response_code": 2000,
                            "response_message": "Login success.",
                            "token": arg2.token,
                            "response_data": {
                                "profile_type": arg2.profileRes.user_type,
                                "profile_details": {
                                    "user_id": arg2.profileRes._id,
                                    "name": arg2.profileRes.name,
                                    "mobile": arg2.profileRes.mobile,
                                    "email": arg2.profileRes.email,
                                    "profile_pic": arg2.profileRes.image_url ? config.liveUrl + config.profilepicPath + arg2.profileRes.image_url : ''

                                }
                            }
                        }
                        nextCb(null, loginInfo);
                    }
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
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
                if (content.response_code === 4001) {
                    callback(content);
                }
                if (content.response_code === 2000) {
                    callback(content);
                }
                if (content.response_code === 5000) {
                    callback(content);
                }
            }
        })
    },
    userList: (userData, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
                if (arg1.response_code === 2000) {
                    UserModels.getUsersAdmin(userData, function (userList) {
                        //console.log(userList);
                        nextCb(null, userList);
                    })
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
                if (content.response_code === 5005) {
                    callback(content);
                }
                if (content.response_code === 5002) {
                    callback(content);
                }
                if (content.response_code === 4001) {
                    callback(content);
                }
                if (content.response_code === 2000) {
                    callback(content);
                }
                if (content.response_code === 5000) {
                    callback(content);
                }
            }
        })
    },
    userDetails: (data, callback) => {
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
                    UserModels.getUserDetails(data, function (meal) {
                        nextCb(null, meal);
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
                        "response_message": "Meal Category",
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
    registerUser: (userData, callback) => {
        async.waterfall([
                function (nextCb) {
                    if (!userData.name || typeof userData.name === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide first name",
                            "response_data": {}
                        });
                    }
                    if (!userData.gender || typeof userData.gender === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide your gender",
                            "response_data": {}
                        });
                    } else if (!userData.email || typeof userData.email === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide email",
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
                        userData._id = new ObjectID;
                        userData.authtoken = crypto.randomBytes(32).toString('hex');
                        var random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
                        var sh1Pass = sha1(random);
                        userData.password = sh1Pass;
                        userData.apptype = 'ADMIN';
                        UserModels.registerUser(userData, function (signUpRes) {
                            signUpRes.random = random;
                            nextCb(null, signUpRes);
                        })
                    }
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                }
            ],
            function (err, content) {
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
                        mailProperty('userSignUpSuccess')(userData.email, {
                            OTP: content.random,
                            name: userData.name,
                            email: userData.email
                        }).send();
                        callback({
                            "response_code": 2000,
                            "response_message": "You have registered successfully.",
                            "response_data": {
                                "authtoken": content.response_data.authtoken,
                                "cat_selected": content.response_data.cat_selected,
                                "profile_type": content.response_data.user_type,
                                "profile_details": {
                                    "user_id": content.response_data._id,
                                    "name": content.response_data.name,
                                    "username": content.response_data.username,
                                    "email": content.response_data.email,
                                    "gender": content.response_data.gender,
                                    "profile_pic": content.response_data.image_url ? config.liveUrl + config.profilepicPath + content.response_data.image_url : '',
                                    "aboutme": content.response_data.aboutme
                                }
                            }
                        })
                    }
                    if (content.response_code === 5000) {
                        //callback(content);
                        callback({
                            "response_code": 5000,
                            "response_message": content.response_message,
                            "response_data": {
                                "authtoken": content.response_data.authtoken,
                                "cat_selected": content.response_data.cat_selected,
                                "profile_type": content.response_data.user_type,
                                "profile_details": {
                                    "user_id": content.response_data._id,
                                    "name": content.response_data.name,
                                    "username": content.response_data.username,
                                    "email": content.response_data.email,
                                    "profile_pic": content.response_data.image_url ? config.liveUrl + config.profilepicPath + content.response_data.image_url : '',
                                    "gender": content.response_data.gender
                                }
                            }
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
    updateUserProfile: (profileData, callback) => {
        profileData.user_id = profileData._id;
        async.waterfall([
            function (nextCb) {
                if (profileData.length <= 0) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please provide user data",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {
                        "response_code": 2000
                    });
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
                if (arg1.response_code === 2000) {



                    UserModels.update({
                        _id: profileData.user_id
                    }, {
                        $set: {
                            name: profileData.name,
                            email: profileData.email,
                            aboutme: profileData.aboutme,
                            username: profileData.username,
                            gender: profileData.gender,
                        }
                    }, function (err, data) {
                        if (err) {
                            nextCb(null, {
                                "response_code": 5005,
                                "success": false,
                                "message": "INTERNAL DB ERROR",
                                "response_data": {}
                            })
                        }
                        if (data.n === 1 && data.nModified === 1) {
                            UserModels.findOne({
                                _id: profileData.user_id
                            }, function (err, res) {
                                if (err) {
                                    nextCb(null, {
                                        "response_code": 5005,
                                        "success": false,
                                        "message": "INTERNAL DB ERROR.",
                                        "response_data": {}
                                    })

                                } else {
                                    nextCb(null, {
                                        "response_code": 2000,
                                        "success": true,
                                        "message": "User updated successfully.",
                                        "response_data": res
                                    })


                                }
                            })

                        }

                    })





                }
            },
            function (arg2, nextCb) {
                if (arg2.response_code === 5002) {
                    nextCb(null, arg2);
                }
                if (arg2.response_code === 5005) {
                    nextCb(null, arg2);
                }
                if (arg2.response_code === 5000) {
                    nextCb(null, arg2);
                }
                if (arg2.response_code === 2000) {
                    if (arg2.response_data.user_type == 'Social') {
                        config.liveUrl = '';
                        config.profilepicPath = '';
                    }
                    var profileData = {
                        "response_code": 2000,
                        "success": true,
                        "message": "Profile updated successfully.",
                        "response_data": {
                            "authtoken": arg2.response_data.authtoken,
                            "profile_type": arg2.response_data.user_type,
                            "profile_details": {
                                "user_id": arg2.response_data._id,
                                "name": arg2.response_data.name,
                                "username": arg2.response_data.username,
                                "email": arg2.response_data.email,
                                "gender": arg2.response_data.gender,
                                "profile_pic": arg2.response_data.image_url ? config.liveUrl + config.profilepicPath + arg2.response_data.image_url : '',
                                "aboutme": arg2.response_data.aboutme,
                            }
                        }
                    }
                    nextCb(null, profileData);
                }
            }
        ], function (err, content) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "success": false,
                    "message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (content.response_code === 5002) {
                callback(content);
            }
            if (content.response_code === 5000) {
                callback(content);
            }
            if (content.response_code === 5005) {
                callback(content);
            }
            if (content.response_code === 2000) {
                callback(content);
            }

        })
    },


};
module.exports = adminService;