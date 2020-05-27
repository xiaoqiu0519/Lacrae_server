var express = require('express');
var router = express.Router();
let fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {	
  fs.readFile('./public/database/imgdata.json', function(err, data) {
      res.json({
        error:'0000',
        data:JSON.parse(data.toString())
      })
  });
});



module.exports = router;
