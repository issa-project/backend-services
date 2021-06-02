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
  //const url = 'https://covidontheweb.inria.fr/sparql';
  const url = process.env.URL;
  const query =`select *
                where {
                <http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:title ?title.
                }LIMIT 10`;

  (async () => {
    let cons;
    let result;

    try {
      result = await d3.sparql(url, query).then((data) => {
        cons =console.log("----------------------->"+data);
        return data;
      }).then(res => res.data);


    } catch (err) {
      result = err
    }
    res.status(200).json({ result })
  })()
});


/*  GET article metaData (title , date , articleType ) */

router.get('/getArticleMetadata', (req, res) => {
  const url = 'https://covidontheweb.inria.fr/sparql';
  const query =`select *
                where {
                OPTIONAL { <http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:title ?title.}
                OPTIONAL { <http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:issued ?date.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dce:creator ?authors.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> schema:publication ?pub.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:license ?license.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> bibo:doi ?doi.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> bibo:pmid ?pmid.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> fabio:hasPubMedId ?hasPubMedId.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:source ?source.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> schema:url ?url.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dce:language ?lang.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:language ?lang2.}
                OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:abstract [rdf:value ?abs].}
                }LIMIT 100`;
  (async () => {
    let cons;
    let result;
    let listRes;

    try {
      result = await d3.sparql(url, query).then((data) => {
        cons =console.log("----------------------->"+data);
        return data;

      }).then(res => res);

    } catch (err) {
      result = err
    }
    res.status(200).json({ result })
  })()

});


module.exports = router;


/* Request 1:

select *
where {
OPTIONAL { <http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:title ?title.}
OPTIONAL { <http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:issued ?date.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dce:creator ?authors.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> schema:publication ?pub.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:license ?license.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> bibo:doi ?doi.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> bibo:pmid ?pmid.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> fabio:hasPubMedId ?hasPubMedId.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:source ?source.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> schema:url ?url.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dce:language ?lang.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:language ?lang2.}
OPTIONAL {<http://ns.inria.fr/issa/f74923b3ce82c984a7ae3e0c2754c9e33c60554f> dct:abstract [rdf:value ?abs].}
}LIMIT 100
 */
