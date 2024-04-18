from aethel.frontend import Sample
from src.aethel.scripts.search import Query, Sample

# The following filters are based on those in aethel/scripts/search.py, but now using substring checks instead of exact matches.


def in_lemma(query_string: str) -> Query:
    def f(sample: Sample) -> bool:
        return any(
            query_string in item.lemma
            for phrase in sample.lexical_phrases
            for item in phrase.items
        )

    return Query(f)


def in_word(query_string: str) -> Query:
    def f(sample: Sample) -> bool:
        return any(
            query_string in item.word
            for phrase in sample.lexical_phrases
            for item in phrase.items
        )

    return Query(f)
