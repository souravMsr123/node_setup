var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

// Export your module
var EquipmentModel = mongoose.model("Equipment", function () {
    var equipment = new mongoose.Schema({
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
    equipment.plugin(mongoosePaginate);
    equipment.plugin(mongooseAggregatePaginate);
    equipment.statics.newEquipment = function (equipment, callback) {
            equipment._id = new ObjectID
            new EquipmentModel(equipment).save(function (err, response_data) {
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
        equipment.statics.editEquipment = function (equipment, callback) {
            EquipmentModel.findById(equipment.id, function (err, doc) {
                if (doc) {
                    doc.name = equipment.name;
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
        equipment.statics.deleteEquipment = function (equipment, callback) {
            EquipmentModel.findById(equipment.id, function (err, doc) {
                if (doc) {
                    doc.name = equipment.name;
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
                        "response_message": "Equipment Not Found"
                    })
                }
            })
        }
    equipment.statics.getAllEquipment = function (params, callback) {
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
        EquipmentModel.paginate(query, {
            // select: 'name email phone city user_type',
            sort,
            page: page,
            limit: limit
        }, function (err, equipments) {
            if (err) {
                callback({
                    success: false,
                    response_code: 5002,
                    response_message: "Internal server error",
                    errors: err
                });
            } else {
                console.log('equipments', equipments);
                callback({
                    success: true,
                    response_code: 2000,
                    response_message: "equipments list",
                    response_data: equipments
                    //result: users
                });
            }
        });
    }
    equipment.statics.getAllEquipmentList = function (params, callback) {
        EquipmentModel.find({}, function (err, equipment) {
            if (!err) {
                if (equipment) {
                    callback({
                        "response_code": 2000,
                        "response_data": equipment
                    })
                } else {
                    // callback({"response_code": 2000,"response_data": {}})
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
    equipment.statics.getEquipment = function (data, callback) {
        EquipmentModel.findById(data.id, function (err, equipment) {
            if (!err) {
                if (equipment) {
                    callback({
                        "response_code": 2000,
                        "response_data": equipment
                    })
                } else {
                    // callback({"response_code": 2000,"response_data": {}})
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
    return equipment;
}());

module.exports = EquipmentModel;