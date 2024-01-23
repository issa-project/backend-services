"""
This script retrieves the labels and URIs of the Wikidata named entities (NE) assigned to articles.
Field 'count' gives the number of articles that have that NE either in the title, abstract or body.
The result is used for the auto-completion of user inputs on the search form.
"""

from SPARQLQuery import submit_sparql_query_chain

limit = 10000
totalResults = 90000

prefixes = '''
PREFIX schema: <http://schema.org/>
PREFIX skos:   <http://www.w3.org/2004/02/skos/core#>
'''

query_tpl = prefixes + '''
SELECT distinct ?entityUri ?entityLabel ?entityPrefLabel ?entityType (count(?document) as ?count)
FROM NAMED <http://data-issa.cirad.fr/graph/entity-fishing-nes>         # annotations about the named entities
FROM NAMED <http://data-issa.cirad.fr/graph/wikidata-named-entities>    # dump of the entities from Wikidata (hierarchy and labels)
WHERE {
  {
    SELECT distinct ?entityUri ?document
    FROM <http://data-issa.cirad.fr/graph/entity-fishing-nes>
    WHERE {
      ?annotation a oa:Annotation; oa:hasBody ?entityUri; schema:about ?document.
    }
  }

  { GRAPH <http://data-issa.cirad.fr/graph/wikidata-named-entities> {
      {
          ?entityUri rdfs:label ?entityLabel.
          FILTER (langMatches(lang(?entityLabel), "en"))
      } UNION {
          ?entityUri skos:altLabel ?entityLabel; rdfs:label ?entityPrefLabel.
          FILTER (langMatches(lang(?entityLabel), "en"))
          FILTER (langMatches(lang(?entityPrefLabel), "en"))
      }
    }

    bind("Wikidata" as ?entityType)
  }
}  group by ?entityUri ?entityLabel ?entityPrefLabel ?entityType
offset %(offset)s
limit %(limit)s
'''

if __name__ == '__main__':
    results_json = submit_sparql_query_chain(query_tpl, totalResults, limit)
    with open(f"../data/dumpWikidataNamedEntities.json", 'w', encoding="utf-8") as f:
        f.write(results_json)
