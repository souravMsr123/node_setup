var express = require("express");
var AdminModels = require('../models/admin');
var MealCategoryModels = require('../models/mealCategory');
var MealModels = require('../models/meal');
var config = require('../config');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var secretKey = config.secretKey;
var async = require("async");
var mongo = require('mongodb');
var crypto = require('crypto');
var sha1 = require('node-sha1');
var ObjectID = mongo.ObjectID;
var baseUrl = config.baseUrl;

var mealService = {
    // Meal Category Management
    addMealCategory: (data, callback) => {
        //  callback(data);
        async.waterfall([
            function (nextCb) {
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide name",
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
                    MealCategoryModels.newMealCategory(data, function (meal) {
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
                        "response_message": "Category Added successfully.",
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
    updateMealCategory: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide name",
                        "response_data": {}
                    });
                }
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
                    MealCategoryModels.editMealCategory(data, function (meal) {
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
                        "response_message": "Category Updated successfully.",
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
    deleteMealCategory: (data, callback) => {
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
                    MealCategoryModels.deleteMealCategory(data, function (meal) {
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
                        "response_message": "Category Deleted successfully.",
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
    getAllMealCategory: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    MealCategoryModels.getAllMealCategory(data, function (meal) {
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
    getAllMealCategoryList: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    MealCategoryModels.getAllMealCategoryList(data, function (meal) {
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
    getMealCategory: (data, callback) => {
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
                    MealCategoryModels.getMealCategory(data, function (meal) {
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

    // Meal Managaement Services
    getMealCategoryArray: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.user_id || typeof data.user_id === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide user id",
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
                    MealCategoryModels.getMealCategoryArray(data, function (meal) {
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
                        "response_message": "Meals",
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
    addmeal: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide name",
                        "response_data": {}
                    });
                }
                if (!data.meal_category || typeof data.meal_category === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Add A Category Type",
                        "response_data": {}
                    });
                }
                if (!data.calories || typeof data.calories === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Calories Quantity",
                        "response_data": {}
                    });
                }
                if (!data.protien || typeof data.protien === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Protien Quantity",
                        "response_data": {}
                    });
                }
                if (!data.carbohydrate || typeof data.carbohydrate === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Carbohydrate Quantity",
                        "response_data": {}
                    });
                }
                if (!data.fat || typeof data.fat === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Fat Quantity",
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
                    MealModels.addMeal(data, function (meal) {
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
                        "response_message": "Meal Added successfully.",
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
    editmeal: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.id || typeof data.id === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please provide Id",
                        "response_data": {}
                    });
                }
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please provide Name",
                        "response_data": {}
                    });
                }
                if (!data.meal_category || typeof data.meal_category === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Add A Category Type",
                        "response_data": {}
                    });
                }
                if (!data.calories || typeof data.calories === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Calories Quantity",
                        "response_data": {}
                    });
                }
                if (!data.protien || typeof data.protien === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Protien Quantity",
                        "response_data": {}
                    });
                }
                if (!data.carbohydrate || typeof data.carbohydrate === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Carbohydrate Quantity",
                        "response_data": {}
                    });
                }
                if (!data.fat || typeof data.fat === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "Please Give Fat Quantity",
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
                    MealModels.editMeal(data, function (meal) {
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
                        "response_message": "Meal Updated successfully.",
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
    deletemeal: (data, callback) => {
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
                    MealModels.deleteMeal(data, function (meal) {
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
                        "response_message": "Meal Deleted successfully.",
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
    getmeal: (data, callback) => {
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
                    MealModels.getMeal(data, function (meal) {
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
                        "response_message": "Meals",
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
    getallmeal: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    MealModels.getAllMeal(function (meal) {
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
                        "response_message": "Meals",
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
    getallmeals: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    MealModels.getAllMeals(data, function (meal) {
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
                        "response_message": "Meals",
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
    // getMealBy
    getMealBy: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                if (!data.meal_type || typeof data.meal_type === undefined) {
                    nextCb(null, {
                        "response_code": 5002,
                        "response_message": "please provide Meal Type",
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
                    MealModels.getMealBy(data, function (meal) {
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
                        "response_message": "Meals",
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
    }

}

module.exports = mealService;