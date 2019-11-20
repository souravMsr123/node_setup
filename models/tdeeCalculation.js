var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;
// Export your module
var TdeeCalculationModels = mongoose.model("TdeeCalculation", function () {

    var tdee = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false
        },
        gender: {
            type: String,
            enum: [
                'Male', 'Female', 'Other'
            ],
            default: 'Male'
        },
        weight: {
            weight_type: {
                type: String,
                required: false
            },
            weight_value: {
                type: Number,
                required: false
            }
        },
        height: {
            height_type: {
                type: String,
                required: false
            },
            height_value: {
                type: Number,
                required: false
            }
        },
        age: {
            type: Number,
            required: false
        },
        bmr: {
            type: Number,
            required: false
        },
        body_fat: {
            type: Number,
            required: false
        },
        activity_level: {
            type: String,
            required: false
        },
        goal_settings: {
            goal: {
                type: String,
                required: false
            },
            calorie_target: {
                type: Number,
                required: false
            },
            calorie_range: {
                min: {
                    type: Number,
                    required: false
                },
                max: {
                    type: Number,
                    required: false
                }
            }
        },
        macros: {
            carbs: {
                type: Number,
                required: false
            },
            fat: {
                type: Number,
                required: false
            },
            protein: {
                type: Number,
                required: false
            },
            fibre: {
                type: Number,
                required: false
            }
        }

    }, {timestamps: true});
    tdee.statics.newTDEE = function (tdee, callback) {
        tdee._id = new ObjectId;
        new TdeeCalculationModels(tdee).save(function (err, response_data) {
            if (!err) {
                console.log("[registered tdee]");
                callback({"response_code": 2000,
                 response_data});
            } else {
                console.log(err);
                callback(
                    {"response_code": 5005, "response_message": "INTERNAL DB ERROR", "response_data": err}
                )
            }
        })
    }
    return tdee;

}());

module.exports = TdeeCalculationModels;