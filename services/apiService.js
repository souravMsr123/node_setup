'use strict';
var express = require("express");
var config = require('../config');
var async = require("async");
var mongo = require('mongodb');
var crypto = require('crypto');
var sha1 = require('node-sha1');
var fs = require('fs');
var util = require('util');
var logger = require('morgan');
var mailProperty = require('../modules/sendMail');
var pushNotification = require('../modules/pushNotification');
var ObjectID = mongo.ObjectID;
var baseUrl = config.baseUrl;
var ObjectID = mongo.ObjectID;
var jwt = require('jsonwebtoken');
var secretKey = config.secretKey;

var fileUpload = require('express-fileupload');

//express().use(fileUpload());
//======================MONGO MODELS============================

var UserModels = require('../models/user');

//======================MONGO MODELS============================

var apiService = {
    jwtAuthVerification: (jwtData, callback) => {
        if (jwtData.authtoken && jwtData.user_id) {
            UserModels.authenticate(jwtData, function (auth) {
                callback(auth);
            })
        }else{
            callback({
                response_code:5000,
                message: "Could Not Authenticate User"
            });
        }
    },
    signupUser: (userData, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!userData.apptype || typeof userData.apptype === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide apptype",
                        "response_data": {}
                    });
                }
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
                } else if (!userData.password || typeof userData.password === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide password",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {"response_code": 2000});
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    userData._id = new ObjectID;
                    userData.authtoken = crypto
                        .randomBytes(32)
                        .toString('hex');
                    UserModels.registerUser(userData, function (signUpRes) {
                        nextCb(null, signUpRes);
                    })
                }
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
            }
        ], function (err, content) {
            if (err) {
                callback(
                    {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": err}
                )
            }
            if (!err) {
                // console.log(content);
                if (content.response_code === 2000) {
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
                                "dob": content.response_data.dob,
                                "email": content.response_data.email,
                                "gender": content.response_data.gender,
                                "profile_pic": content.response_data.image_url
                                    ? content.response_data.image_url
                                    : ''
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
                                "dob": content.response_data.dob,
                                "email": content.response_data.email,
                                "profile_pic": content.response_data.image_url
                                    ? content.response_data.image_url
                                    : '',
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
    updateProfile: (userData, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!userData.user_id || typeof userData.user_id === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide id",
                        "response_data": {}
                    });
                } else {
                    nextCb(null, {"response_code": 2000});
                }
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 5002) {
                    nextCb(null, arg1);
                }
                if (arg1.response_code === 2000) {
                    
                    UserModels.updateUserProfile(userData, function (updateRes) {
                        nextCb(null, updateRes);
                    })
                }
            }
        ], function (err, content) {
            if (err) {
                callback(
                    {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": err}
                )
            }
            if (!err) {
                if (content.response_code === 2000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "User Updated successfully.",
                        "response_data": content.response_data
                    })
                }
                if (content.response_code === 5000) {
                    callback({
                        "response_code": 2000,
                        "response_message": "User Updated successfully.",
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
    
        socialSignup: (userData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!userData.name || typeof userData.name === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide first name",
                            "response_data": {}
                        });
                    } else if (!userData.image_url || typeof userData.image_url === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide profile image",
                            "response_data": {}
                        });
                    } else if (!userData.devicetoken || typeof userData.devicetoken === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide device token",
                            "response_data": {}
                        });
                    } else if (!userData.social_id || typeof userData.social_id === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide social id",
                            "response_data": {}
                        });
                    } else {
                        nextCb(null, {"response_code": 2000});
                    }
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                    if (arg1.response_code === 2000) {
                        userData._id = new ObjectID;
                        userData.authtoken = crypto
                            .randomBytes(32)
                            .toString('hex');
                        userData.user_type = 'Social';
                        UserModels.socialSignup(userData, function (socialSignupRes) {
                            nextCb(null, socialSignupRes);
                        })
                    }
                }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": err}
                    )
                }
                if (!err) {
                    if (content.response_code === 2000) {
                        callback({
                            "response_code": 2000,
                            "response_message": "You have registered successfully.",
                            "response_data": {
                                "authtoken": content.response_data.authtoken,
                                "profile_type": content.response_data.user_type,
                                "profile_details": {
                                    "user_id": content.response_data._id,
                                    "name": content.response_data.name,
                                    "dob": content.response_data.dob,
                                    "email": content.response_data.email,
                                    "gender": content.response_data.gender,
                                    "profile_pic": content.response_data.image_url
                                        ? content.response_data.image_url
                                        : '',
                                    "aboutme": content.response_data.aboutme
                                }
                            }
                        })
                    }
                    if (content.response_code === 5000) {
                        callback({
                            "response_code": 2000,
                            "response_message": "User login successfully.",
                            "response_data": {
                                "authtoken": content.authtoken,
                                "profile_type": content.response_data.user_type,
                                "profile_details": {
                                    "user_id": content.response_data._id,
                                    "name": content.response_data.name,
                                    "dob": content.response_data.dob,
                                    "email": content.response_data.email,
                                    "gender": content.response_data.gender,
                                    "profile_pic": content.response_data.image_url
                                        ? content.response_data.image_url
                                        : ''
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
        login: (loginData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!loginData.apptype || typeof loginData.apptype === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide apptype",
                            "response_data": {}
                        });
                    }
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
                        nextCb(null, {"response_code": 2000});
                    }

                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                    if (arg1.response_code === 2000) {
                        UserModels.login(loginData, function (loginInfo) {
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
                                "response_data": {
                                    "authtoken": arg2.profileRes.authtoken,
                                    "cat_selected": arg2.profileRes.cat_selected,
                                    "profile_type": arg2.profileRes.user_type,
                                    "profile_details": {
                                        "user_id": arg2.profileRes._id,
                                        "name": arg2.profileRes.name,
                                        "dob": arg2.profileRes.dob,
                                        "email": arg2.profileRes.email,
                                        "gender": arg2.profileRes.gender,
                                        "profile_pic": arg2.profileRes.image_url !=""?arg2.profileRes.image_url: null,
                                        "body_fat": arg2.profileRes.body_fat != null ?arg2.profileRes.body_fat: null,
                                        "body_weight":arg2.profileRes.body_weight != null ?arg2.profileRes.body_weight:null,
                                        "height": arg2.profileRes.height != null ?arg2.profileRes.height:null
                                    }
                                }
                            }
                            nextCb(null, loginInfo);
                        }
                    }
                }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": err}
                    )
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
        logout: (logoutData, callback) => {
            if (logoutData.user_id && logoutData.apptype) {
                UserModels.logout(logoutData, function (logoutRes) {
                    callback(logoutRes);
                })
            } else {
                callback(
                    {"response_code": 5002, "response_message": " insufficient information provided", "response_data": {}}
                )
            }
        },
        changePassword: (changePasswordData, callback) => {
            if (changePasswordData.user_id && changePasswordData.password && changePasswordData.new_password) {
                UserModels.changePassword(changePasswordData, function (passwordRes) {
                    callback(passwordRes);
                })
            } else {
                callback(
                    {"response_code": 5002, "response_message": " insufficient information provided", "response_data": {}}
                )
            }
        },

        forgotPassword: (forgotPasswordData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!forgotPasswordData.email || typeof forgotPasswordData.email === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide user email",
                            "response_data": {}
                        });
                    } else if (!forgotPasswordData.apptype || typeof forgotPasswordData.apptype === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide apptype ",
                            "response_data": {}
                        });
                    } else {
                        nextCb(null, {"response_code": 2000});
                    }
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                    if (arg1.response_code === 2000) {
                        UserModels.verifyUser(forgotPasswordData, function (userData) {
                            nextCb(null, userData);
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
                    if (arg2.response_code === 2000) {
                        var random = Math
                            .random()
                            .toString(36)
                            .replace(/[^a-z]+/g, '')
                            .substr(0, 6);
                        var sh1Pass = sha1(random);
                        console.log(sh1Pass);
                        UserModels.savePassword(forgotPasswordData, sh1Pass, function (userData) {
                            userData.random = random;
                            nextCb(null, userData);
                        })
                    }
                }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": {}}
                    )
                }
                if (!err) {
                    if (content.response_code === 2000) {
                        mailProperty('forgotPasswordMail')(forgotPasswordData.email, {
                            OTP: content.random,
                            email: forgotPasswordData.email
                        }).send();
                        callback(
                            {"response_code": 2000, "response_message": "New password will be sent to your mail.", "response_data": {}}
                        )
                    }
                    if (content.response_code === 5002) {
                        callback(content);
                    }
                    if (content.response_code === 5005) {
                        callback(content);
                    }
                }
            })
        },
        resendOTP: (forgotPasswordData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!forgotPasswordData.email || typeof forgotPasswordData.email === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide user email",
                            "response_data": {}
                        });
                    } else if (!forgotPasswordData.apptype || typeof forgotPasswordData.apptype === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide apptype ",
                            "response_data": {}
                        });
                    } else {
                        nextCb(null, {"response_code": 2000});
                    }
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                    if (arg1.response_code === 2000) {
                        UserModels.verifyUser(forgotPasswordData, function (userData) {
                            nextCb(null, userData);
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
                    if (arg2.response_code === 2000) {
                        // var random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
                        var random = Math.floor(Math.random() * 90000) + 10000;
                        // console.log(sh1Pass);
                        forgotPasswordData.otp = random
                        UserModels.setOTP(forgotPasswordData, function (userData) {
                            userData.random = random;
                            nextCb(null, userData);
                        })
                    }
                }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": {}}
                    )
                }
                if (!err) {
                    if (content.response_code === 2000) {
                        mailProperty('resetPasswordMail')(forgotPasswordData.email, {
                            OTP: content.random,
                            email: forgotPasswordData.email
                        }).send();
                        callback(
                            {"response_code": 2000, "response_message": "A password reseting OTP has been sent to your mail.", "response_data": {}}
                        )
                    }
                    if (content.response_code === 5002) {
                        callback(content);
                    }
                    if (content.response_code === 5005) {
                        callback(content);
                    }
                }
            })
        },
        setPassword: (resetPasswordData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!resetPasswordData.email || typeof resetPasswordData.email === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "Please provide user email",
                            "response_data": {}
                        });
                    } else if (!resetPasswordData.new_password || typeof resetPasswordData.new_password === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "Please enter new password",
                            "response_data": {}
                        });
                    } else if (!resetPasswordData.apptype || typeof resetPasswordData.apptype === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "Please provide apptype ",
                            "response_data": {}
                        });
                    } else {
                        nextCb(null, {"response_code": 2000});
                    }
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                    if (arg1.response_code === 2000) {
                        UserModels.getUserByEmail(resetPasswordData.email, function (profileData) {
                            if (profileData) {
                                if (profileData.otp_verified == true) {
                                    nextCb(null, {"response_code": 2000});
                                } else {
                                    nextCb(null, {
                                        "response_code": 5002,
                                        "response_message": "OTP not verified!",
                                        "response_data": {}
                                    });
                                }

                            } else {
                                nextCb(null, {
                                    "response_code": 5002,
                                    "response_message": "Email-ID does not exist!",
                                    "response_data": {}
                                });
                            }
                        });
                        // UserModels.savePassword(resetPasswordData, resetPasswordData.reset_password ,
                        // function (userData) {     nextCb(null, userData); })
                    }
                },
                function (arg2, nextCb) {
                    if (arg2.response_code === 5002) {
                        nextCb(null, arg2);
                    }
                    if (arg2.response_code === 5005) {
                        nextCb(null, arg2);
                    }
                    if (arg2.response_code === 2000) {

                        UserModels.savePassword(
                            resetPasswordData,
                            resetPasswordData.new_password,
                            function (userData) {
                                nextCb(null, userData);
                            }
                        )
                        // var random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
                        // var sh1Pass = sha1(random); console.log(sh1Pass);
                        // UserModels.savePassword(forgotPasswordData, sh1Pass, function (userData) {
                        // userData.random = random;     nextCb(null, userData); })
                    }
                }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": {}}
                    )
                }
                if (!err) {
                    if (content.response_code === 2000) {
                        callback(content);
                    }
                    if (content.response_code === 5002) {
                        callback(content);
                    }
                    if (content.response_code === 5005) {
                        callback(content);
                    }
                    if (content.response_code === 4001) {
                        callback(content);
                    }
                }
            })
        },
        verifyOTP: (resetPasswordData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!resetPasswordData.email || typeof resetPasswordData.email === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "Please provide user email",
                            "response_data": {}
                        });
                    } else if (!resetPasswordData.otp || typeof resetPasswordData.otp === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "Please enter otp",
                            "response_data": {}
                        });
                    } else if (!resetPasswordData.apptype || typeof resetPasswordData.apptype === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "Please provide apptype ",
                            "response_data": {}
                        });
                    } else {
                        nextCb(null, {"response_code": 2000});
                    }
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg1);
                    }
                    if (arg1.response_code === 2000) {
                        UserModels.verifyOTP(resetPasswordData, function (userData) {
                            nextCb(null, userData);
                        })
                    }
                },
                // function (arg2, nextCb) {     if (arg2.response_code === 5002) {
                // nextCb(null, arg2);     }     if (arg2.response_code === 5005) {
                // nextCb(null, arg2);     }     if (arg2.response_code === 2000) {         var
                // random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
                // var sh1Pass = sha1(random);         console.log(sh1Pass);
                // UserModels.savePassword(forgotPasswordData, sh1Pass, function (userData) {
                // userData.random = random;             nextCb(null, userData);         })
                // } }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": {}}
                    )
                }
                if (!err) {
                    if (content.response_code === 2000) {
                        callback(content);
                        // mailProperty('forgotPasswordMail')(forgotPasswordData.email, {     OTP:
                        // content.random,     email: forgotPasswordData.email }).send(); callback({
                        // "response_code": 2000,     "response_message": "New password will be sent to
                        // your mail.",     "response_data": {} })
                    }
                    if (content.response_code === 5002) {
                        callback(content);
                    }
                    if (content.response_code === 5005) {
                        callback(content);
                    }
                    if (content.response_code === 4001) {
                        callback(content);
                    }
                }
            })
        },
        userProfile: (userData, callback) => {
            async.waterfall([
                function (nextCb) {
                    if (!userData.user_id || typeof userData.user_id === undefined) {
                        nextCb(null, {
                            "response_code": 5002,
                            "response_message": "please provide user ID",
                            "response_data": {}
                        });
                    } else {
                        nextCb(null, {"response_code": 2000});
                    }

                },

                function (arg1, nextCb) {
                    if (arg1.response_code === 5002) {
                        nextCb(null, arg2);
                    }
                    if (arg1.response_code === 2000) {
                        UserModels.getUserProfile(userData, function (userInfo) {
                            //console.log(userInfo); nextCb(null, userInfo);
                            if (userInfo) {
                                nextCb(null, userInfo)
                            } else {
                                nextCb(null, {
                                    "response_code": 5002,
                                    "response_message": "User not found",
                                    "response_data": {}
                                });

                            }
                        })
                    }
                }
            ], function (err, content) {
                if (err) {
                    callback(
                        {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": err}
                    )
                }
                if (!err) {
                    if (content.response_code === 5005) {
                        callback(content);
                    }
                    if (content.response_code === 5002) {
                        callback(content);
                    }

                    if (content.response_code === 2000) {
                        callback(content);
                    }

                }
            })
        }
    };

    module.exports = apiService;