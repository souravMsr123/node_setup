var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
// var mealCatSchema = require('../models/mealCategory'); Export your module
var MealModels = mongoose.model("Meal", function () {
    var meal = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        meal_category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MealCategory',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        meal_type: {
            type: String,
            enum: [
                'Vegetarian', 'Vegan'
            ],
            default: 'Vegan'
        },
        calories: {
            type: Number,
            required: true
        },
        protien: {
            type: Number,
            required: true
        },
        carbohydrate: {
            type: Number,
            required: true
        },
        fat: {
            type: Number,
            required: true
        },
        meal_recepie: {
            type: String,
            required: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });
    meal.plugin(mongooseAggregatePaginate);
    meal.plugin(mongoosePaginate);
    meal.statics.addMeal = function (meal, callback) {
            meal._id = new ObjectID;
            new MealModels(meal).save(function (err, response_data) {
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
        meal.statics.editMeal = function (meal, callback) {
            MealModels.findById(meal.id, function (err, doc) {
                if (doc) {
                    doc.name = meal.name;
                    doc.meal_category = meal.meal_category;
                    doc.meal_type = meal.meal_type;
                    doc.calories = meal.calories;
                    doc.protien = meal.protien;
                    doc.carbohydrate = meal.carbohydrate;
                    doc.fat = meal.fat;
                    doc.meal_recepie = meal.meal_recepie;
                    doc.isBlocked = meal.isBlocked;
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
                        "response_message": "Meal Not Found"
                    })
                }
            })
        },
        meal.statics.deleteMeal = function (meal, callback) {
            MealModels.findById(meal.id, function (err, doc) {
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
                        "response_message": "Meal Not Found"
                    })
                }
            })
        },
        meal.statics.getMeal = function (data, callback) {
            MealModels
                .findById(data.id, function (err, meals) {
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
                .populate('meal_category')
        },
        meal.statics.getAllMeals = function (params, callback) {
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
            MealModels.paginate(query, {
                // select: 'name email phone city user_type',
                sort: {
                    createdAt: -1
                },
                populate: [
                    'meal_category'
                ],
                page: page,
                limit: limit
            }, function (err, meals) {
                if (err) {
                    callback({
                        success: false,
                        response_code: 5002,
                        response_message: "Internal server error",
                        errors: err
                    });
                } else {
                    console.log('meals', meals);
                    callback({
                        success: true,
                        response_code: 2000,
                        response_message: "mealCat list",
                        response_data: meals
                        //result: users
                    });
                }
            });
        }
    meal.statics.getAllMeal = function (callback) {
            MealModels
                .find({}, function (err, meals) {
                    if (!err) {

                        callback({
                            "response_code": 2000,
                            "response_data": meals
                        })
                    } else {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    }
                })
                .populate('meal_category')
        },
        meal.statics.getMealBy = function (data, callback) {
            MealModels
                .find({
                    meal_type: data.meal_type
                }, function (err, meals) {
                    console.log('From Meal Model', meals)
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
                .populate('meal_category')
        }

    return meal;
}());

module.exports = MealModels;