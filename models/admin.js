var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoosePaginate = require('mongoose-paginate');
// Export your module
var AdminModels = mongoose.model("Admin", function () {

    var s = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String
        },
        authtoken: {
            type: String,
            default: ''
        },
        dob: {
            type: String

        },
        image_url: {
            type: String,
            default: ''
        },
        social_id: {
            type: String,
            default: ''
        },
        mobile: {
            type: String,
            default: ''
        },
        user_type: {
            type: String,
            enum: ['Normal', 'Social'],
            default: 'Normal',
            required: true
        },
        random_pasword_checkin: {
            type: String,
            default: ''
        }
    }, {
        timestamps: true
    });

    s.plugin(mongoosePaginate);

    s.statics.registerUser = function (admin, callback) {
        new AdminModels(admin).save(function (err, response_data) {
            if (!err) {
                console.log("[registered admin]");
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
    }
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
    s.statics.login = function (loginData, callback) {
        console.log(loginData);
        AdminModels.findOne({
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
                var p = AdminModels.comparePassword(loginData.password, profileRes.password);
                if (p === true) {
                    AdminModels.update({
                        _id: profileRes._id
                    }, {
                        $set: {
                            authtoken: loginData.authtoken,
                            apptype: loginData.apptype
                        }
                    }).exec(function (err, us) {
                        if (us.n === 1 && us.nModified === 1) {
                            callback({
                                "response_code": 2000,
                                "profileRes": profileRes
                            });
                        }
                    })
                }
                if (p === false) {
                    callback({
                        "response_code": 4001,
                        "response_message": "Wrong password"
                    });
                }
            }
            if (profileRes === null) {
                callback({
                    "response_code": 5000,
                    "response_message": "No user found"
                });
            }
        })
    }
    s.statics.getUserByEmail = function (email, callback) {
        AdminModels.findOne({
                email: email,
                user_type: 'Normal'
            },
            function (err, res) {
                if (err)
                    console.log(err);
                if (!err)
                    callback(res);
            })

    }

    s.statics.getUsers = function (email, callback) {
        AdminModels.find({
                email: email,
                user_type: 'Normal'
            },
            function (err, res) {
                if (err)
                    console.log(err);
                if (!err)
                    callback(res);
            })

    }


    s.statics.verifyUser = function (userData, callback) {
        console.log(userData);
        AdminModels.find({
            email: userData.email
        }, function (err, res) {
            console.log(res);
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



    s.statics.logout = function (logoutData, callback) {
        AdminModels.update({
            _id: logoutData.user_id
        }, {
            $set: {
                authtoken: ''
            }
        }).exec(function (err, lu) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                })
            }
            if (!err) {
                if (lu.n === 1 && lu.nModified === 1) {
                    callback({
                        "response_code": 2000,
                        "response_message": "You logged out successfully.",
                        "response_data": {}
                    })
                }
            }
        })
    }


    s.statics.updateUserProfile = function (profileData, callback) {
        console.log(profileData);
        if (profileData.user_id && profileData.image_url) {
            AdminModels.update({
                _id: profileData.user_id
            }, {
                $set: {
                    fname: profileData.fname,
                    lname: profileData.lname,
                    mobile: profileData.mobile,
                    image_url: profileData.image_url
                }
            }).exec(function (err, u) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    if (u.n === 1 && u.nModified === 1) {
                        AdminModels.getProfileDetails(profileData.user_id, function (profileRes) {
                            if (profileRes) {
                                callback({
                                    "response_code": 2000,
                                    "response_data": profileRes
                                })
                            }
                        })
                    }


                }
            })
        }
        if (profileData.user_id && !profileData.image_url) {
            AdminModels.update({
                _id: profileData.user_id
            }, {
                $set: {
                    fname: profileData.fname,
                    lname: profileData.lname,
                    mobile: profileData.mobile
                }
            }).exec(function (err, u) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {
                    if (u.n === 1 && u.nModified === 1) {
                        AdminModels.getProfileDetails(profileData.user_id, function (profileRes) {
                            if (profileRes) {
                                callback({
                                    "response_code": 2000,
                                    "response_data": profileRes
                                })
                            }
                        })
                    }


                }
            })
        }
    }
    s.statics.savePassword = function (passData, newPass, callback) {
        bcrypt.hash(newPass, null, null, function (err, hash) {
            if (err) {
                return next(err);
            }
            if (!err) {
                var newPassword = hash;
                AdminModels.update({
                    email: passData.email
                }, {
                    $set: {
                        password: newPassword
                    }
                }).exec(function (err, updated) {
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
                                "response_message": "Succesfully password saved.",
                                "response_data": {}
                            })
                        }
                    }
                })
            }
        });
    }
    s.statics.comparePassword = function (password, dbPassword) {
        return bcrypt.compareSync(password, dbPassword);
    }

    s.statics.authenticate = function (jwtData, callback) {
        if (jwtData.user_id) {
            AdminModels.findOne({
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
    return s;

}());

module.exports = AdminModels;