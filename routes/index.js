var express = require('express');
var router = express.Router();
let d3 = require('d3-sparql');
require('dotenv').config();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



/* GET article title */
router.get('/getArticleTitle', (req, res) => {
  const url = 'https://covidontheweb.inria.fr/sparql';
  const query =`select *
                where {
                <http://ns.inria.fr/covid19/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:title ?title.
                }LIMIT 10`;

  (async () => {
    let cons;
    let result;

    try {
      result = await d3.sparql(url, query).then((data) => {
        cons =console.log("----------------------->"+data);
        return data;
      }).then(res => res[0].title);


    } catch (err) {
      result = err
    }
    res.status(200).json({ result })
  })()
});


/*  GET article metaData (title , date , articleType ) */


module.exports = router;
