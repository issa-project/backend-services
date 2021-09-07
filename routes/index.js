var express = require('express');
var router = express.Router();
let d3 = require('d3-sparql');
require('dotenv').config();
fs = require('fs');

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

/**
 * Read a SPARQL query template and replace the {id} placeholder
 * @param template file name
 * @param id value to replace "{id}" with
 * @returns SPARQL query string
 */
function readTemplate(template, id) {
    let queryTpl = fs.readFileSync('public/queries/' + template, 'utf8');
    let query = replaceAll(queryTpl, "{id}", id);
    return query;
}


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


/* GET article title */
router.get('/getArticleTitle/:id', (req, res) => {
    var articleId = req.params.id;
    const url = process.env.ISSA_SPARQL_ENDPOINT;
    var articleUri = process.env.RESOURCES_NAMESPACE + articleId;
    let query = readTemplate("getArticleTitle.sparql", articleUri);
    console.log("----------->Read template : query : " + query);

    (async () => {
        let cons;
        let result;
        try {
            result = await d3.sparql(url, query).then((data) => {
                cons = console.log("----------------------->" + data);
                return data;
            }).then(res => res);

        } catch (err) {
            console.log("-------------> Error return by sparqlEndpoint : " + err);
            result = err
        }
        res.status(200).json({result})
    })()
});


/*  GET article metaData (title , date , articleType ... )  without the authors */

router.get('/getArticleMetadata/:id', (req, res) => {
    var articleId = req.params.id;
    const url = process.env.ISSA_SPARQL_ENDPOINT;
    var articleUri = process.env.RESOURCES_NAMESPACE + articleId;
    let query = readTemplate("getArticleMetadata.sparql", articleUri);
    console.log("----------->Read template : query : " + query);

    (async () => {
        let cons;
        let result;

        try {
            result = await d3.sparql(url, query).then((data) => {
                cons = console.log("----------------------->" + data);
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()

});


/* GET article authors*/

router.get('/getArticleAuthors/:id', (req, res) => {
    var articleId = req.params.id;
    const url = process.env.ISSA_SPARQL_ENDPOINT;
    var articleUri = process.env.RESOURCES_NAMESPACE + articleId;
    let query = readTemplate("getArticleAuthors.sparql", articleUri);

    (async () => {
        let cons;
        let result;
        try {
            result = await d3.sparql(url, query).then((data) => {
                cons = console.log("----------------------->" + data);
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()

});


/* Get named entities */

router.get('/getAbstractNamedEntities/:id', (req, res) => {
    var articleId = req.params.id;
    const url = process.env.ISSA_SPARQL_ENDPOINT;
    var articleUri = process.env.RESOURCES_NAMESPACE + articleId + "#abstract";
    let query = readTemplate("getAbstractNamedEntities.sparql", articleUri);

    (async () => {
        let cons;
        let result;

        try {
            result = await d3.sparql(url, query).then((data) => {
                cons = console.log("----------------------->" + data);
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()

});

/* Get global descriptors : The global descriptors are concepts characterizing the article as a whole */

router.get('/getArticleDescriptors/:id', (req, res) => {
    var articleId = req.params.id;
    const url = process.env.ISSA_SPARQL_ENDPOINT;
    var articleUri = process.env.RESOURCES_NAMESPACE + articleId;
    let query = readTemplate("getArticleDescriptors.sparql", articleUri);

    (async () => {
        let cons;
        let result;
        try {
            result = await d3.sparql(url, query).then((data) => {
                cons = console.log("----------------------->" + data);
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()
});

module.exports = router;
