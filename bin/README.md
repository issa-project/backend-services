# Generation of files used by the auto-complete service

The `autoComplete` service must be able to complete the user's input against the labels of the descriptors and named entities used in the annotations of articles. 
It must also be capable of completing an input with labels of classes or concepts whose instances, sub-classes or sub-concepts are used in annotations.
Example: Wikidata entity `Q82794` (geographic region) is usually not a named entity, but its instances or sub-classes are.
Therefore, the user must be able to type "geographic region" to look for the articles whose named entities are instances or sub-classes of `Q82794`.

The service does not directly query the SPARQL endpoint as this would be far too slow for smooth interaction.
Instead, it relies on JSON files (stored in [../data](../data)) that list all the entities with their preferred and alternate labels.

These files are generated beforehand by the scripts in this folder. 
For each entity, they include a count of the number of articles that are associated with the entities.  

Script [dumpAgrovocDescriptors.py](dumpAgrovocDescriptors.py) relies on the standard Agrovoc graph.

By contrast, script [dumpWikidataNamedentities.py](dumpWikidataNamedentities.py) relies on named graph `http://data-issa.cirad.fr/graph/wikidata-named-entities` 
that contains a dump of the Wikidata entities used as named entities. This dump also includes inferred `rdf:type` and `rdfs:subClassOf` properties, 
which makes it easier for this script to retrieve the whole hierarchy of each entity.
