var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

// Export your module
var FeedModels = mongoose.model("Feed", function () {
    var feed = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: false
        },
        image_url: {
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
    feed.plugin(mongooseAggregatePaginate);
    feed.plugin(mongoosePaginate);
    feed.statics.newFeed = function (feed, callback) {
            feed._id = new ObjectID
            new FeedModels(feed).save(function (err, response_data) {
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
        feed.statics.uploadImage = function (feed, callback) {
            FeedModels.findByIdAndUpdate(feed.id, feed, function (err, feedData) {

                //console.log('user data', userdata); console.log('user error', err);
                if (err) {
                    console.log('error....', err);
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": err
                    })
                }
                if (feedData) {
                    console.log(7777, feedData);
                    callback({
                        "response_code": 2000,
                        feedData
                    });

                } else {
                    callback({
                        "response_code": 5005,
                        "response_message": "User Not Found"
                    })
                }
            })
        },
        feed.statics.editFeed = function (feed, callback) {
            FeedModels.findById(feed.id, function (err, doc) {
                if (doc) {
                    doc.name = feed.name;
                    doc.content = feed.content;
                    doc.image_url = feed.image_url;
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
                        "response_message": "Feed Not Found"
                    })
                }
            })
        },
        feed.statics.deleteFeed = function (feed, callback) {
            FeedModels.findById(feed.id, function (err, doc) {
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
                        "response_message": "Equipment Not Found"
                    })
                }
            })
        }
    feed.statics.getAllFeed = function (params, callback) {
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
        FeedModels.paginate(query, {
            // select: 'name email phone city user_type',
            sort: {
                createdAt: -1
            },
            page: page,
            limit: limit
        }, function (err, feeds) {
            if (err) {
                callback({
                    success: false,
                    response_code: 5002,
                    response_message: "Internal server error",
                    errors: err
                });
            } else {
                console.log('feeds', feeds);
                callback({
                    success: true,
                    response_code: 2000,
                    response_message: "feeds list",
                    response_data: feeds
                    //result: users
                });
            }
        });
    }
    feed.statics.getFeed = function (data, callback) {
        FeedModels.findById(data.id, function (err, feed) {
            if (!err) {
                if (feed) {
                    callback({
                        "response_code": 2000,
                        "response_data": feed
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
    return feed;
}());

module.exports = FeedModels;