"""
This script retrieves the labels and URIs of all the Wikidata entities referred to in the corpus,
may they be NEs assigned to articles or parents of these NEs.
Field 'count' gives the number of articles that have as NE the Wikidata entity or its sub-entities.
Example: if A and B are sub-classes of C, A is a NE of 10 articles and B is a NE or 20 articles,
then the query will return:
A 10
B 20
C 30
"""

from SPARQLQuery import submit_sparql_query_chain

limit = 10000
totalResults = 90000

query_tpl = '''
PREFIX oa:      <http://www.w3.org/ns/oa#>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema:  <http://schema.org/>
PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>

SELECT distinct ?entityUri ?entityLabel ?entityPrefLabel ?entityType ?count
FROM NAMED <http://data-issa.cirad.fr/graph/entity-fishing-nes>         # annotations about the named entities
FROM NAMED <http://data-issa.cirad.fr/graph/wikidata-named-entities>    # dump of the entities from Wikidata (hierarchy and labels)
WHERE {
  { # This sub-query basically selects the URIs for which we want to have auto-completion.
    # It returns each unique Wikidata entity that is either a NE or a parent of a NE.
    # Example: if a document d has NE A, and A is an instance or subclass of B,
    # then the query returns 2 couples: (d, A) and (d, B).

    SELECT distinct ?entityUri (count(?document) as ?count)
    FROM <http://data-issa.cirad.fr/graph/entity-fishing-nes>
    FROM NAMED <http://data-issa.cirad.fr/graph/wikidata-named-entities>
    WHERE {
      ?a a oa:Annotation; schema:about ?document.

	  { ?a oa:hasBody ?entityUri. }
      UNION
      {
		?a oa:hasBody ?body.
        { graph <http://data-issa.cirad.fr/graph/wikidata-named-entities> {
	        ?body rdfs:subClassOf ?entityUri.
	    }}
      }
    } GROUP BY ?entityUri  OFFSET %(offset)s  LIMIT %(limit)s
  }

  { # This sub-query retrieves all the Wikidata resources (the NEs and their hierarchy) and their labels.
    # All labels, preferred and alternate, are given in ?entityLabel.
    # ?entityPrefLabel is optional, it gives the preferred label in case ?entityLabel contains an alternate label.

    SELECT distinct ?entityUri ?entityLabel ?entityPrefLabel
    FROM <http://data-issa.cirad.fr/graph/wikidata-named-entities>
    WHERE {
      { ?entityUri rdfs:label ?entityLabel. FILTER (langMatches(lang(?entityLabel), "en")) }
      UNION
      { ?entityUri skos:altLabel ?entityLabel; rdfs:label ?entityPrefLabel.
        FILTER (langMatches(lang(?entityPrefLabel), "en"))
        FILTER (langMatches(lang(?entityLabel), "en"))
      }
    }
  }

  BIND("Wikidata" as ?entityType)
}
'''

if __name__ == '__main__':
    results_json = submit_sparql_query_chain(query_tpl, totalResults, limit)
    with open(f"../data/dumpWikidataNamedEntities.json", 'w', encoding="utf-8") as f:
        f.write(results_json)
