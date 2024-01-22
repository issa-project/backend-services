"""
This script retrieves the labels and URIs of the Agrovoc concepts that are used
as descriptors of at least one article in the ISSA dataset.
Field 'count' gives the number of articles that have that concept as a descriptor.

The result is used for the auto-completion of user inputs on the search form.
"""

from SPARQLQuery import submit_sparql_query_chain

limit = 10000
totalResults = 18000

prefixes = '''
PREFIX skosxl:         <http://www.w3.org/2008/05/skos-xl#>
'''

query_tpl = prefixes + '''
SELECT distinct ?entityUri ?entityLabel ?entityPrefLabel ?entityType (count(?document) as ?count)
FROM NAMED <http://data-issa.cirad.fr/graph/thematic-descriptors>
FROM NAMED <http://data-issa.cirad.fr/graph/annif-descriptors>
FROM NAMED <http://agrovoc.fao.org/graph>
WHERE {
  {
    SELECT distinct ?entityUri ?document
    FROM <http://data-issa.cirad.fr/graph/thematic-descriptors>
    FROM <http://data-issa.cirad.fr/graph/annif-descriptors>
    WHERE {
      ?annotation oa:hasBody ?entityUri; oa:hasTarget ?document.
    }
  }

  { GRAPH <http://agrovoc.fao.org/graph> {
      {
          ?entityUri skosxl:prefLabel/skosxl:literalForm ?entityLabel.
          FILTER (langMatches(lang(?entityLabel), "en"))
      } UNION {
          ?entityUri skosxl:altLabel/skosxl:literalForm ?entityLabel; skosxl:prefLabel/skosxl:literalForm ?entityPrefLabel
          FILTER (langMatches(lang(?entityLabel), "en"))
          FILTER (langMatches(lang(?entityPrefLabel), "en"))
      }
    }

    bind("Agrovoc descriptor" as ?entityType)
  }
}  group by ?entityUri ?entityLabel ?entityPrefLabel ?entityType
offset %(offset)s
limit %(limit)s
'''

if __name__ == '__main__':
    results_json = submit_sparql_query_chain(query_tpl, totalResults, limit)
    with open(f"../data/dumpAgrovocDescriptors.json", 'w', encoding="utf-8") as f:
        f.write(results_json)
