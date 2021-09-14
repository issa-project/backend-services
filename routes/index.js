var express = require('express');
var router = express.Router();
let d3 = require('d3-sparql');
const logger = require("../modules/logger");
const {isDebug} = require("../modules/logger");
const log = logger.application;
require('dotenv').config();
fs = require('fs');

log.info('Starting up backend services');

/**
 * Replace all occurrences if "find" with "replace" in string "template"
 * @param template
 * @param find
 * @param replace
 * @returns {*}
 */
function replaceAll(template, find, replace) {
    return template.replace(new RegExp(find, 'g'), replace);
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
/* router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
}); */


/**
 * Get article metaData (title , date , articleType ... )  without the authors
 * @param uri: URL parameter
 */
router.get('/getArticleMetadata/', (req, res) => {
    let articleUri = req.query.uri;
    let query = readTemplate("getArticleMetadata.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleMetadata - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let cons;
        let result;
        try {
            result = await d3.sparql(process.env.ISSA_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleMetadata - SPARQL response: ');
                    data.forEach(res => log.debug(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()

});


/* GET article authors*/

router.get('/getArticleAuthors/', (req, res) => {
    let articleUri = req.query.uri;
    let query = readTemplate("getArticleAuthors.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleAuthors - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let cons;
        let result;
        try {
            result = await d3.sparql(process.env.ISSA_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleAuthors - SPARQL response: ');
                    data.forEach(res => log.debug(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()

});


/* Get named entities */

router.get('/getAbstractNamedEntities/', (req, res) => {
    let articleUri = req.query.uri;
    articleUri = articleUri + "#abstract";
    let query = readTemplate("getAbstractNamedEntities.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getAbstractNamedEntities - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let cons;
        let result;

        try {
            result = await d3.sparql(process.env.ISSA_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getAbstractNamedEntities - SPARQL response: ');
                    data.forEach(res => log.debug(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()

});

/* Get global descriptors : The global descriptors are concepts characterizing the article as a whole */

router.get('/getArticleDescriptors/', (req, res) => {
    let articleUri = req.query.uri;
    let query = readTemplate("getArticleDescriptors.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleDescriptors - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let cons;
        let result;
        try {
            result = await d3.sparql(process.env.ISSA_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleDescriptors - SPARQL response: ');
                    data.forEach(res => log.debug(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            result = err
        }
        res.status(200).json({result})
    })()
});

module.exports = router;
