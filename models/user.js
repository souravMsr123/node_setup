var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

// Export your module
var UserModels = mongoose.model("User", function () {
    var s = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            enum: [
                'Male', 'Female', 'Other'
            ],
            default: 'Male'
        },
        dob: {
            type: Number,
            required: true
        },
        authtoken: {
            type: String,
            default: ''
        },
        user_type: {
            type: String,
            enum: [
                'Normal', 'Social'
            ],
            default: 'Normal',
            required: true
        },
        devicetoken: {
            type: String,
            default: ''
        },
        image_url: {
            type: String,
            default: ''
        },
        apptype: {
            type: String,
            required: true
        },
        social_id: {
            type: String,
            default: ''
        },
        otp: {
            type: Number,
            default: ''
        },
        otp_verified: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        notify: {
            type: Boolean,
            default: false
        },
        height: {
            feet: {
                type: String,
                required: false
            },
            inches: {
                type: String,
                required: false
            }
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
        body_fat: {
            type: Number,
            required: false
        }

    }, {
        timestamps: true
    });
    s.plugin(mongooseAggregatePaginate);
    s.plugin(mongoosePaginate);

    s.pre('save', function (next) {
        var user = this;
        if (!user.isModified('password'))
            return next();

        bcrypt.hash(user.password, null, null, function (err, hash) {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        });
    });
    s.statics.registerUser = function (user, callback) {
            this.getUserByEmail(user.email, function (res) {
                console.log("res", res);
                if (res === null) {
                    user._id = new ObjectID
                    new UserModels(user).save(function (err, response_data) {
                        if (!err) {
                            console.log("[registered user]");
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
                } else {

                    console.log("[user already registered]");
                    callback({
                        "response_code": 5000,
                        "response_message": "Already registered with this email",
                        "response_data": res
                    })

                }
            })
        },
        s.statics.getUserDetails = function (data, callback) {
            UserModels.findById(data.id, function (err, user) {
                if (!err) {
                    if (user) {
                        callback({
                            "response_code": 2000,
                            "response_data": user
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
    s.statics.updateUserProfile = function (user, callback) {
        //callback(555);
        console.log("User Model", user);
        UserModels.findByIdAndUpdate(user.user_id, user, {
            new: 1
        }, function (err, userdata) {

            //console.log('user data', userdata); console.log('user error', err);
            if (err) {
                console.log('error....', err);
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            }
            if (userdata) {
                console.log(7777, userdata);
                callback({
                    "response_code": 2000,
                    "response_message": "Profile Updated Successfully",
                    "response_data": userdata
                });

            } else {
                callback({
                    "response_code": 5005,
                    "response_message": "User Not Found"
                })
            }
        })
    }
    s.statics.getUserByEmail = function (email, callback) {
        UserModels.findOne({
            email: email,
            user_type: 'Normal'
        }, function (err, res) {
            if (err)
                console.log(err);
            if (!err)
                callback(res);
        })
    }
    s.statics.getUserByUserId = function (userId, callback) {
        //console.log(userId);
        UserModels.findOne({
            _id: userId,
            isBlocked: false
        }, function (err, res) {
            //       console.log(res)
            if (err)
                console.log(err);
            if (!err)
                callback(res);
        })
    }
    s.statics.verifyUser = function (userData, callback) {
        //console.log(userData);
        UserModels.find({
            email: userData.email
        }, function (err, res) {
            // console.log(res);
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {
                        err
                    }
                })
            }
            if (!err) {
                if (res.length == 0) {
                    callback({
                        "response_code": 5002,
                        "response_message": "Email not registered.",
                        "response_data": {}
                    })
                } else {
                    if (res[0].social_id === '') {
                        callback({
                            "response_code": 2000,
                            "response_message": "User Found.",
                            "response_data": {
                                res
                            }
                        })
                    } else {
                        callback({
                            "response_code": 5002,
                            "response_message": "Email not registered.",
                            "response_data": {}
                        })
                    }
                }
            }
        })
    }
    s.statics.getProfileDetails = function (user_id, callback) {
        console.log('user_id', user_id)
        if (user_id) {
            UserModels.findOne({
                _id: user_id
            }, function (err, u) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    callback(u);
                }
            })
        }
    }
    s.statics.login = function (loginData, callback) {

        UserModels.findOne({
            email: loginData.email
        }, function (err, profileRes) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                })
            }
            if (profileRes) {
                //console.log(profileRes);

                var p = UserModels.comparePassword(loginData.password, profileRes.password);
                if (p === true) {
                    var conditions = {
                        _id: profileRes._id
                    };
                    var token = crypto
                        .randomBytes(32)
                        .toString('hex');
                    // var deviceToken=[]; deviceToken.push(loginData.devicetoken);

                    let fields = {
                        authToken: token,
                        apptype: loginData.apptype,
                        devicetoken: loginData.devicetoken
                    };

                    options = {
                        upsert: false
                    };
                    UserModels.update(conditions, fields, options, function (err, affected) {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": {}
                            })
                        } else {
                            profileRes.authtoken = token;
                            profileRes.deviceToken = loginData.devicetoken;
                            profileRes.apptype = loginData.apptype;
                            profileRes.save();
                            callback({
                                "response_code": 2000,
                                "profileRes": profileRes
                            });
                        }
                    });

                }
                if (p === false) {
                    callback({
                        "response_code": 4001,
                        "response_message": "Either email/password is wrong",
                        "response_data": {}
                    });
                }
            }
            if (profileRes === null) {
                callback({
                    "response_code": 5000,
                    "response_message": "No user found",
                    "response_data": {}
                });
            }
        })
    }
    s.statics.logout = function (logoutData, callback) {
        var deviceToken = [];

        deviceToken.push(logoutData.devicetoken);
        var conditions = {
            _id: logoutData.user_id
        };

        let fields = {
            authToken: '',
            devicetoken: ''
        };

        options = {
            upsert: false
        };
        UserModels.update(conditions, fields, options, function (err, affected) {
            // console.log(err); console.log(affected);
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                })
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "You logged out successfully.",
                    "response_data": {}
                });
            }
        });
    }
    s.statics.savePassword = function (passData, newPass, callback) {
        bcrypt.hash(newPass, null, null, function (err, hash) {
            if (err) {
                return next(err);
            }
            if (!err) {
                var newPassword = hash;
                //console.log(newPassword);
                UserModels
                    .update({
                        email: passData.email
                    }, {
                        $set: {
                            password: newPassword,
                            otp_verified: true
                        }
                    })
                    .exec(function (err, updated) {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": {}
                            })
                        }
                        if (!err) {
                            if (updated.n === 1 && updated.nModified === 1) {
                                callback({
                                    "response_code": 2000,
                                    "response_message": "Password saved succesfully.",
                                    "response_data": {}
                                })
                            }
                        }
                    })
            }
        });
    }
    s.statics.setOTP = function (reqData, callback) {
        //console.log(newPassword);
        UserModels
            .update({
                email: reqData.email,
                user_type: 'Normal'
            }, {
                $set: {
                    otp: reqData.otp,
                    otp_verified: false
                }
            })
            .exec(function (err, updated) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    if (updated.n === 1 && updated.nModified === 1) {
                        callback({
                            "response_code": 2000,
                            "response_message": "OTP saved successfully.",
                            "response_data": {}
                        })
                    }
                }
            })
    }
    s.statics.comparePassword = function (password, dbPassword) {
        //console.log(password);
        return bcrypt.compareSync(password, dbPassword);
    }
    s.statics.authenticate = function (jwtData, callback) {
        if (jwtData.user_id) {
            UserModels.findOne({
                _id: jwtData.user_id
            }, function (err, u) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    // console.log('u', u);

                    if (u.authtoken && u.authtoken === jwtData.authtoken) {
                        callback({
                            "response_code": 2000,
                            "response_message": "authentication success"
                        })
                    } else {
                        callback({
                            "response_code": 4000,
                            "response_message": "authentication failed"
                        })
                    }

                }
            })
        }
    }
    s.statics.getUsers = function (userData, callback) {
            console.log(userData)
            var search = []
            if (userData.name) {
                search.push({
                    name: {
                        $regex: ".*" + userData.name + ".*",
                        $options: 'i'
                    }
                })
            }
            if (userData.email) {
                search.push({
                    email_address: {
                        $regex: ".*" + userData.email + ".*",
                        $options: 'i'
                    }
                })
            }
            if (userData.skill) {
                search.push({
                    skills: {
                        $regex: ".*" + userData.skill + ".*",
                        $options: 'i'
                    }
                })
            }
            if (userData.level) {
                search.push({
                    level: {
                        $regex: ".*" + userData.level + ".*",
                        $options: 'i'
                    }
                })
            }
            // UserModels.aggregate([     {         $match:{                 $and:search }
            // },     {         $project:{             name:1, email_address:1,
            // mobile_no:1,             total_exp:1, skills:1,             level:1,
            // image_url:1         }     } ]).exec( console.log(search.length);
            let keyword = search.length > 0 ?
                search : [{
                    isBlocked: false
                }];
            console.log("sekeyword", keyword);
            UserModels.find({
                $and: keyword
            }, function (err, res) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    // callback(res);
                    callback({
                        "response_code": 2000,
                        "response_message": "success",
                        "response_data": res
                    });
                }
            })
        },
        s.statics.getUsersAdmin = function (params, callback) {
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
            UserModels.paginate(query, {
                // select: 'name email phone city user_type',
                sort,
                page: page,
                limit: limit
            }, function (err, users) {
                if (err) {
                    callback({
                        success: false,
                        response_code: 5002,
                        response_message: "Internal server error",
                        errors: err
                    });
                } else {
                    console.log('users', users);
                    callback({
                        success: true,
                        response_code: 2000,
                        response_message: "User list",
                        response_data: users
                        //result: users
                    });
                }
            });
        }
    s.statics.getUsersAdmin1 = function (userData, callback) {
        var aggregate = UserModels.aggregate([{
            $lookup: {
                from: "reportusers",
                localField: "_id",
                foreignField: "reportuser_id",
                as: "reportuser"
            }
        }, {
            $project: {

                name: 1,
                username: 1,
                email: 1,
                gender: 1,
                aboutme: 1,
                user_type: 1,
                image_url: 1,
                isBlocked: 1,
                createdAt: 1,
                reportCount: {
                    $size: "$reportuser"
                }
            }
        }])
        var options = {

        };
        UserModels.aggregatePaginate(
            aggregate,
            options,
            function (err, results, pageCount, count) {
                if (err) {
                    console.log(err)
                    callback({
                        "success": false,
                        "response_code": 5000,
                        "response_message": "INTERNAL DB ERROR",
                        "total_record": 0,
                        "response_data": {}
                    })
                } else {
                    //console.log(results.length);
                    if (results.length == 0) {
                        callback({
                            "success": true,
                            "response_code": 5002,
                            "total_record": 0,
                            "response_message": "No user found",
                            "response_data": []
                        })
                    } else {
                        console.log('kjguhde', results);

                        callback({
                            "success": true,
                            "response_code": 2000,
                            "response_message": "New user list.",
                            "total_record": count,
                            "response_data": results
                        })
                    }

                }
            }
        ) //End pagination
    }
    s.statics.getUserList = function (userData, callback) {
        // console.log(userData);
        BlockuserModel.blockList(userData, function (blockres) {
            // console.log( "userIdArr",  userData.userIdArr) console.log("blockres",
            // blockres.response_data)
            if (blockres.response_data.length > 0) {
                userData.userIdArr = userData
                    .userIdArr
                    .filter(val => !blockres.response_data.includes(val));
            }
            //  console.log(userData.userIdArr);
            var aggregate = UserModels.aggregate([{
                $match: {
                    _id: {
                        $in: userData.userIdArr
                    }
                }
            }, {
                $project: {
                    name: 1,
                    user_type: 1,
                    email: 1,
                    image_url: 1,
                    gender: 1,
                    is_following: ""
                }
            }])
            //start pagination
            var options = {
                page: userData.page,
                limit: 10
            };
            UserModels.aggregatePaginate(
                aggregate,
                options,
                function (err, results, pageCount, count) {
                    if (err) {
                        console.log(err)
                    } else {
                        //console.log(results.length);
                        if (results.length == 0) {
                            callback({
                                "response_code": 5002,
                                "total_record": 0,
                                "response_message": "No user found",
                                "response_data": []
                            })
                        } else {
                            callback({
                                "response_code": 2000,
                                "response_message": "New user list.",
                                "total_record": count,
                                "response_data": results
                            })
                        }

                    }
                }
            ) //End pagination

        })
    }
    s.statics.getUserProfile = function (userData, callback) {
        // console.log(userData);
        var findwith = userData.user_id;

        if (findwith) {
            UserModels.findOne({
                _id: findwith
            }, function (err, profileRes) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    //console.log(profileRes);
                    if (profileRes != null) {
                        async.parallel({
                            user: function (callback) {
                                callback(null, profileRes);
                            },
                            // following: function(callback){
                            // FollowersModel.getFollowingUserList({userId:findwith}, function
                            // (followingRes) {     console.log('following');     console.log(followingRes);
                            // if(followingRes.response_code===2000)         {            callback(null,{
                            // "following_count":followingRes.total             })        }else{
                            // callback(null,{                 "following_count":0             })        }
                            // }) }, followers: function(callback){
                            // FollowersModel.getFollowerUserList({userId:findwith}, function (followerRes)
                            // {         console.log('followers');         console.log(followerRes); let
                            // follower_users=followerRes.response_data;         let
                            // arrindex=follower_users.indexOf(userData.user_id); console.log(arrindex)
                            // if(followerRes.response_code===2000)         { callback(null,{
                            // "followers_count":followerRes.total, "is_following":arrindex>-1?true:false
                            // })        }else{ callback(null,{                 "followers_count":0,
                            // "is_following":arrindex>-1?true:false             })        }    }) },

                        }, function (err, results) {
                            // results is now equals to: {one: 1, two: 2}
                            var userdetails = {
                                "response_code": 2000,
                                "response_message": "Success",
                                "response_data": {
                                    "authtoken": results.user.authtoken,
                                    "profile_type": results.user.user_type,
                                    "profile_details": {
                                        "user_id": results.user._id,
                                        "name": results.user.name,
                                        "username": results.user.username,
                                        "devicetoken": results.user.devicetoken,
                                        "apptype": results.user.apptype,
                                        "email": results.user.email,
                                        "gender": results.user.gender,
                                        "dob": results.user.dob,
                                        "profile_pic": results.user.image_url
                                    }
                                }
                            }
                            callback(userdetails);
                        });
                    } else {
                        callback({
                            "response_code": 5002,
                            "response_message": "No user found",
                            "response_data": {}
                        })
                    }
                }
            })
        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": {}
            })
        }
    }
    s.statics.changePassword = function (changePasswordData, callback) {
        UserModels.getProfileDetails(
            changePasswordData.user_id,
            function (profileData) {
                if (profileData) {
                    var p = UserModels.comparePassword(
                        changePasswordData.password,
                        profileData.password
                    );
                    if (p === true) {
                        bcrypt.hash(changePasswordData.new_password, null, null, function (err, hash) {
                            if (err) {
                                return next(err);
                            }
                            if (!err) {
                                var token = crypto
                                    .randomBytes(32)
                                    .toString('hex');
                                UserModels
                                    .update({
                                        _id: changePasswordData.user_id
                                    }, {
                                        $set: {
                                            password: hash,
                                            authtoken: token
                                        }
                                    })
                                    .exec(function (err, cpu) {
                                        if (err) {
                                            callback({
                                                "response_code": 5005,
                                                "response_message": "INTERNAL DB ERROR",
                                                "response_data": {}
                                            })
                                        }
                                        if (!err) {
                                            if (cpu.n === 1 && cpu.nModified === 1) {
                                                callback({
                                                    "response_code": 2000,
                                                    "response_message": "Your password has been changed successfully",
                                                    "response_data": {
                                                        "authtoken": token
                                                    }
                                                })
                                            }
                                        }
                                    })
                            }

                        });
                    }
                    if (p === false) {
                        callback({
                            "response_code": 4001,
                            "response_message": "Existing Password Incorrect",
                            "response_data": {}
                        })
                    }
                }
            }
        )
    }
    s.statics.verifyOTP = function (resetPasswordData, callback) {
        console.log('resetPasswordData', resetPasswordData);
        UserModels.getUserByEmail(resetPasswordData.email, function (profileData) {
            console.log('profileData', profileData);
            if (profileData) {
                // var p = UserModels.comparePassword(resetPasswordData.password,
                // profileData.password);
                if (profileData.otp_verified == false) {
                    if (parseInt(resetPasswordData.otp) === profileData.otp) {
                        var token = crypto
                            .randomBytes(32)
                            .toString('hex');
                        UserModels
                            .update({
                                _id: profileData._id
                            }, {
                                $set: {
                                    otp_verified: true,
                                    authtoken: token
                                }
                            })
                            .exec(function (err, cpu) {
                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data": {}
                                    })
                                }
                                if (!err) {
                                    if (cpu.n === 1 && cpu.nModified === 1) {
                                        callback({
                                            "response_code": 2000,
                                            "response_message": "OTP verified successfully",
                                            "response_data": {
                                                "authtoken": token
                                            }
                                        })
                                    }
                                }
                            })

                    } else {
                        callback({
                            "response_code": 4001,
                            "response_message": "Invalid OTP!",
                            "response_data": {}
                        })
                    }
                } else {
                    callback({
                        "response_code": 5002,
                        "response_message": "OTP already verified/expired!",
                        "response_data": {}
                    })
                }
            }
        })
    }

    return s;

}());

module.exports = UserModels;