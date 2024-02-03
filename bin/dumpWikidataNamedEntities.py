"""
This script retrieves the labels and URIs of all the Wikidata entities referred to in the abstracts of the articles in the corpus,
may they be NEs assigned to articles or parents of these NEs. This way we can search an entity that is not explicitly a named entity,
but whose sub-classes or instances are named entities.

Field 'count' gives the number of articles that have as NE the Wikidata entity or its sub-entities.
Example: if A and B are sub-classes of C, A is a NE of 10 articles and B is a NE or 20 articles,
then the query will return:
A 10
B 20
C 30
"""

from SPARQLQuery import submit_sparql_query_chain, submit_sparql_query, endpoint
limit = 10000

# This query counts the total number of URIs for which we want to get the labels.
# This includes the NEs themselves but also all their parents.
count_query_tpl = '''
PREFIX oa:      <http://www.w3.org/ns/oa#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema:  <http://schema.org/>

SELECT count(distinct ?entityUri) as ?count
FROM <http://data-issa.cirad.fr/graph/entity-fishing-nes>
FROM NAMED <http://data-issa.cirad.fr/graph/wikidata-named-entities>
WHERE {
  ?a a oa:Annotation; schema:about ?document.
  ?a oa:hasTarget [ oa:hasSource ?abstract ].
  FILTER (strEnds(str(?abstract), "#abstract"))

  { ?a oa:hasBody ?entityUri. }
  UNION
  {
    ?a oa:hasBody ?body.
    { graph <http://data-issa.cirad.fr/graph/wikidata-named-entities> {
        ?body rdfs:subClassOf ?entityUri.
      }}
  }
}
'''

query_tpl = '''
PREFIX oa:      <http://www.w3.org/ns/oa#>
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
      ?a oa:hasTarget [ oa:hasSource ?abstract ].
      FILTER (strEnds(str(?abstract), "#abstract"))

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
    print("Counting the number of URIs to process...")
    results_json = submit_sparql_query(endpoint, count_query_tpl)
    totalUris = results_json['results']['bindings'][0]['count']['value']
    print(f"Number of URIs to process: {totalUris}")

    results_json = submit_sparql_query_chain(query_tpl, int(totalUris), limit)
    with open(f"../data/dumpWikidataNamedEntities.json", 'w', encoding="utf-8") as f:
        f.write(results_json)
