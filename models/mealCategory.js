var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var MealsModels = require('../models/meal');
// Export your module
var MealCategoryModels = mongoose.model("MealCategory", function () {
    var mealCategory = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
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
    mealCategory.plugin(mongooseAggregatePaginate);
    mealCategory.plugin(mongoosePaginate);
    mealCategory.statics.newMealCategory = function (mealCat, callback) {
            mealCat._id = new ObjectID
            new MealCategoryModels(mealCat).save(function (err, response_data) {
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
        mealCategory.statics.editMealCategory = function (mealCat, callback) {
            MealCategoryModels.findById(mealCat.id, function (err, doc) {
                if (doc) {
                    doc.name = mealCat.name;
                    doc.isBlocked = mealCat.isBlocked;
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
                        "response_message": "Category Not Found"
                    })
                }
            })
        },
        mealCategory.statics.deleteMealCategory = function (mealCat, callback) {
            MealCategoryModels.findById(mealCat.id, function (err, doc) {
                if (doc) {
                    doc.name = mealCat.name;
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
                        "response_message": "Category Not Found"
                    })
                }
            })
        }
    mealCategory.statics.getAllMealCategory = function (params, callback) {
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
        MealCategoryModels.paginate(query, {
            // select: 'name email phone city user_type',
            sort: {
                createdAt: -1
            },
            page: page,
            limit: limit
        }, function (err, mealCat) {
            if (err) {
                callback({
                    success: false,
                    response_code: 5002,
                    response_message: "Internal server error",
                    errors: err
                });
            } else {
                console.log('mealCat', mealCat);
                callback({
                    success: true,
                    response_code: 2000,
                    response_message: "mealCat list",
                    response_data: mealCat
                    //result: users
                });
            }
        });
    }
    mealCategory.statics.getAllMealCategoryList = function (params, callback) {
        MealCategoryModels.find({}, function (err, workouttype) {
            if (!err) {
                if (workouttype) {
                    callback({
                        "response_code": 2000,
                        "response_data": workouttype
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
    mealCategory.statics.getMealCategory = function (data, callback) {
        MealCategoryModels.findById(data.id, function (err, meals) {
            if (!err) {
                if (meals) {
                    callback({
                        "response_code": 2000,
                        "response_data": meals
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
    mealCategory.statics.getMealCategoryArray = function (data, callback) {
        MealCategoryModels.find()
            .exec()
            .then(cat => {
                var categoryList = [];

                async.each(cat, (item, cb) => {
                    var blnk_obj = {};

                    MealsModels.find({
                            meal_category: item._id
                        })
                        .exec((err, res) => {

                            if (res) {
                                console.log('response', res);

                                blnk_obj['category'] = item.name;
                                blnk_obj['data'] = res;

                                console.log('data', blnk_obj['data'].length == 0);
                                if (blnk_obj['data'].length != 0) {
                                    categoryList.push(blnk_obj);
                                }

                                cb();
                            }
                        })


                }, () => {
                    callback({
                        "response_code": 2000,
                        "response_data": categoryList
                    })
                })
            })
            .catch(err => {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": err
                })
            })
    }
    return mealCategory;
}());

module.exports = MealCategoryModels;