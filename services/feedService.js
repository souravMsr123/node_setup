var express = require("express");
var AdminModels = require('../models/admin');
var FeddModels = require('../models/feed');
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

var feedService = {
    addFeed: (data, callback) => {
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
                    FeddModels.newFeed(data, function (feed) {
                        nextCb(null, feed);
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
                        "response_message": "Feed Added successfully.",
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
    updateFeed: (data, callback) => {
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
                    FeddModels.editFeed(data, function (feed) {
                        nextCb(null, feed);
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
                        "response_message": "Feed Updated successfully.",
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
    deleteFeed: (data, callback) => {
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
                    FeddModels.deleteFeed(data, function (feed) {
                        nextCb(null, feed);
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
                        "response_message": "Feed Deleted successfully.",
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
    getAllFeed: (data, callback) => {
        async.waterfall([
            function (nextCb) {
                nextCb(null, {
                    "response_code": 2000
                });
            },
            function (arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    FeddModels.getAllFeed(data, function (feed) {
                        nextCb(null, feed);
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
                        "response_message": "Feed",
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
    getFeed: (data, callback) => {
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
                    FeddModels.getFeed(data, function (feed) {
                        nextCb(null, feed);
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
                        "response_message": "Feed",
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

module.exports = feedService;