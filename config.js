module.exports = {
    "port": 1110,
    "secretKey": "hyrgqwjdfbw4534efqrwer2q38945765",
    production: {
        username: 'brain1uMMong0User',
        password: 'PL5qnU9nuvX0pBa',
        host: '68.183.173.21',
        port: '27017',
        dbName: 'munrofitness',
        authDb: 'admin'
        //mongoose.connection.on
    },
    local: {
        database: "mongodb://localhost:27017/munrofitness",
        MAIL_USERNAME: "liveapp.brainium@gmail.com",
        MAIL_PASS: "YW5kcm9pZDIwMTY",
        //mongoose.connection.on
    },
    admin_mail: "aloke.brainium@gmail.com",
    profilepicPath: "public/uploads/profilepic/",

    liveUrl: "http://nodeserver.brainiuminfotech.com:1110",


}