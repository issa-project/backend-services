var express = require('express');
var router = express.Router();
let d3 = require('d3-sparql');
require('dotenv').config();
fs = require('fs');

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function readTemplate(template, idArticle){
  let queryF =  fs.readFileSync('public/sparqlTemplate/' + template, 'utf8');
  let queryWithId =  replaceAll(queryF,"{idArticle}",idArticle);
  return queryWithId;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET article title */
router.get('/getArticleTitle/:id', (req, res) => {
  var idArticle = req.params.id;
  const url = process.env.ISSA_SPARQL_ENDPOINT;
  var idArticleFinal = "<http://ns.inria.fr/issa/" + idArticle + ">";
  let query = readTemplate("getArticleTitle.txt",idArticleFinal);

  console.log("----------->Read template : query : "+query);
  //console.log("-----------> article id : "+idArticle)

  (async () => {
    let cons;
    let result;

    try {
      result = await d3.sparql(url, query).then((data) => {
        cons =console.log("----------------------->"+data);
        return data;
      }).then(res => res);


    } catch (err) {
      console.log("-------------> Error return by sparqlEndpoint : " + err);
      result = err
    }
    res.status(200).json({ result })
  })()
});


/*  GET article metaData (title , date , articleType ... )  without the authors */

router.get('/getArticleMetadata/:id', (req, res) => {
  var idArticle = req.params.id;
  const url = process.env.ISSA_SPARQL_ENDPOINT;
  var idArticleFinal = "<http://ns.inria.fr/issa/" + idArticle + ">";
  let query = readTemplate("getArticleMetadata.txt",idArticleFinal);
  console.log("----------->Read template : query : "+query);
  (async () => {
    let cons;
    let result;

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


/* GET article authors*/

router.get('/getArticleAuthors/:id', (req, res) => {
  var idArticle = req.params.id;
  const url = process.env.ISSA_SPARQL_ENDPOINT;
  var idArticleFinal = "<http://ns.inria.fr/issa/" + idArticle + ">";
  let query = readTemplate("getArticleAuthors.txt",idArticleFinal);
  (async () => {
    let cons;
    let result;

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


/* Get named entities */

router.get('/getArticleNamedEntities/:id', (req, res) => {
  var idArticle = req.params.id;
  const url = process.env.ISSA_SPARQL_ENDPOINT;
  var idArticleFinal = "<http://ns.inria.fr/issa/" + idArticle + ">";
  let query = readTemplate("getArticleNamedEntities.txt",idArticleFinal);
  (async () => {
    let cons;
    let result;

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

/* Get global descriptors : The global descriptors are concepts characterizing the article as a whole */

router.get('/getArticleDescriptors/:id', (req, res) => {
  var idArticle = req.params.id;
  const url = process.env.ISSA_SPARQL_ENDPOINT;
  var idArticleFinal = "<http://ns.inria.fr/issa/" + idArticle + ">";
  let query = readTemplate("getArticleDescriptors.txt",idArticleFinal);
  (async () => {
    let cons;
    let result;

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
