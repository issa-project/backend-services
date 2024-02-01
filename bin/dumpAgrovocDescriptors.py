"""
This script retrieves the labels and URIs of the Agrovoc concepts referred to in the corpus
as descriptors of at least one article in the ISSA dataset.
Field 'count' gives the number of articles that have that concept or its sub-concepts as a descriptor.
Example: if A and B are sub-concepts of C, A is a descriptor of 10 articles and B is a descriptor or 20 articles,
then the query will return:
A 10
B 20
C 30
"""

from SPARQLQuery import submit_sparql_query_chain

limit = 10000
totalResults = 25000

query_tpl = '''
PREFIX oa:      <http://www.w3.org/ns/oa#>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
PREFIX skosxl:  <http://www.w3.org/2008/05/skos-xl#>

SELECT distinct ?entityUri ?entityLabel ?entityPrefLabel ?entityType ?count
FROM NAMED <http://data-issa.cirad.fr/graph/thematic-descriptors>
FROM NAMED <http://data-issa.cirad.fr/graph/annif-descriptors>
FROM NAMED <http://agrovoc.fao.org/graph>
WHERE {
  { # This sub-query basically selects the URIs for which we want to have auto-completion.
    # It returns each unique Agrovoc concept that is either a descriptor or a parent of a descriptor.
    # Example: if a document d has descriptor A, and A has broader B,
    # then the query returns 2 couples: (d, A) and (d, B).

    SELECT distinct ?entityUri (count(distinct ?document) as ?count)
    FROM <http://data-issa.cirad.fr/graph/thematic-descriptors>
    FROM <http://data-issa.cirad.fr/graph/annif-descriptors>
	FROM NAMED <http://agrovoc.fao.org/graph>
    WHERE {
      ?a oa:hasTarget ?document.

      { ?a oa:hasBody ?entityUri. }
      UNION
      { ?a oa:hasBody ?body. { graph <http://agrovoc.fao.org/graph> { ?body skos:broader+ ?entityUri. }}}
    } GROUP BY ?entityUri
  }

  { # This sub-query retrieves all the Agrovoc concepts (the descriptor and their hierarchy) and their labels.
    # All labels, preferred and alternate, are given in ?entityLabel.
    # ?entityPrefLabel is optional, it gives the preferred label in case ?entityLabel contains an alternate label.

    GRAPH <http://agrovoc.fao.org/graph> {
      {
          ?entityUri skosxl:prefLabel/skosxl:literalForm ?entityLabel.
          FILTER (langMatches(lang(?entityLabel), "en"))
      } UNION {
          ?entityUri skosxl:altLabel/skosxl:literalForm ?entityLabel; skosxl:prefLabel/skosxl:literalForm ?entityPrefLabel
          FILTER (langMatches(lang(?entityLabel), "en"))
          FILTER (langMatches(lang(?entityPrefLabel), "en"))
      }
    }
  }

  BIND("Agrovoc" as ?entityType)
} OFFSET %(offset)s  LIMIT %(limit)s
'''

if __name__ == '__main__':
    results_json = submit_sparql_query_chain(query_tpl, totalResults, limit)
    with open(f"../data/dumpAgrovocDescriptors.json", 'w', encoding="utf-8") as f:
        f.write(results_json)
