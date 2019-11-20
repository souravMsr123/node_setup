var express = require('express');
var router = express.Router();

/ GET home page. /
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/MunroAdmin', function (req, res, next) {
  res.send('/MunroAdmin/index');
})

router.post('/uploadTest', (req, res) => {
  res.json(req.files);
})
module.exports = router