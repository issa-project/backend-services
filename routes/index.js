let express = require('express');
let fs = require('fs');
let logger = require("../modules/logger");
let d3 = require('d3-sparql');
require('dotenv').config();

let log = logger.application;
let router = express.Router();
let agrovoc = require('../data/dumpAgrovocEntities.json')

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
    let queryTpl = fs.readFileSync('queries/' + template, 'utf8');
    let query = replaceAll(queryTpl, "{id}", id);
    return query;
}


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
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleMetadata - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getArticleMetadata error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * GET article authors
 * @param uri: URL parameter
 */
router.get('/getArticleAuthors/', (req, res) => {
    let articleUri = req.query.uri;
    let query = readTemplate("getArticleAuthors.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleAuthors - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleAuthors - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getArticleAuthors error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Get named entities
 * @param uri: URL parameter
 */
router.get('/getAbstractNamedEntities/', (req, res) => {
    let articleUri = req.query.uri;
    articleUri = articleUri + "#abstract";
    let query = readTemplate("getNamedEntities.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getNamedEntities - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;

        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getNamedEntities - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getAbstractNamedEntities error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Get the geographical named entities whatever the article part
 * @param uri: URL parameter
 */
router.get('/getGeographicNamedEntities/', (req, res) => {
    let articleUri = req.query.uri;
    let query = readTemplate("getGeographicNamedEntities.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getGeographicNamedEntities - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;

        let opts = {method: 'POST'};
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query, opts).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getGeographicalNamedEntities - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getGeographicalNamedEntities error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Get global descriptors : The global descriptors are concepts characterizing the article as a whole
 * @param uri: URL parameter
 */
router.get('/getArticleDescriptors/', (req, res) => {
    let articleUri = req.query.uri;
    let query = readTemplate("getArticleDescriptors.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleDescriptors - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleDescriptors - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getArticleDescriptors error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Complete the user's input using the Agrovoc labels
 * @param input: first characters entered by the use
 */
router.get('/autoCompleteAgrovocSparql/', (req, res) => {
    let input = req.query.input;
    let query = readTemplate("autoCompleteAgrovoc.sparql", input);
    if (log.isDebugEnabled()) {
        log.debug('autoCompleteAgrovocSparql - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('autoCompleteAgrovocSparql - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('autoCompleteAgrovocSparql error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Complete the user's input using the Agrovoc labels
 * @param input: first characters entered by the use
 */
router.get('/autoCompleteAgrovoc/', (req, res) => {
    let input = req.query.input.toLowerCase();

    // Count the number of entities selected (to return ony a maximum number)
    let _count = 0;

    // Search for entities whose label starts like the input
    let _startsWith = agrovoc.filter(_entity => {
        if (_count < process.env.SEARCH_MAX_AUTOCOMPLETE) {
            if (_entity.entityLabel.toLowerCase().startsWith(input)) {
                _count++;
                return true;
            }
        } else return false;
    });
    if (log.isTraceEnabled()) {
        log.trace('autoCompleteAgrovoc - Result _startsWith: ');
        _startsWith.forEach(res => log.trace(res));
    }

    let _includes = agrovoc.filter(_entity => {
        if (_count < process.env.SEARCH_MAX_AUTOCOMPLETE) {
            let _entityLabLow = _entity.entityLabel.toLowerCase()

            // Find entities whose label includes the input but that was not already selected above
            if (_entityLabLow.includes(input) &&
                ! _startsWith.some(_s => _s.entityLabel.toLowerCase() === _entityLabLow && _s.entityUri === _entity.entityUri)) {
                _count++;
                return true;
            }
        } else return false;
    });
    if (log.isTraceEnabled()) {
        log.trace('autoCompleteAgrovoc - Result includes: ');
        _includes.forEach(res => log.trace(res));
    }

    res.status(200).json(_startsWith.concat(_includes));
});

module.exports = router;
