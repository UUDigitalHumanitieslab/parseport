from __future__ import annotations
from typing import Iterable, Callable, Iterator
from aethel.frontend import Sample

# The following methods and classes have been extracted from aethel.scripts.search (not part of the published library), with some minor customisations / simplifications.


def search(bank: Iterable[Sample], query: Callable[[Sample], bool]) -> Iterator[Sample]:
    return filter(query, bank)


def in_lemma(query_string: str) -> Query:
    def f(sample: Sample) -> bool:
        return any(
            query_string.lower() in item.lemma.lower()
            for phrase in sample.lexical_phrases
            for item in phrase.items
        )

    return Query(f)


def in_word(query_string: str) -> Query:
    def f(sample: Sample) -> bool:
        return any(
            query_string.lower() in item.word.lower()
            for phrase in sample.lexical_phrases
            for item in phrase.items
        )

    return Query(f)


class Query:
    def __init__(self, fn: Callable[[Sample], bool]):
        self.fn = fn

    def __and__(self, other: Query) -> Query:
        def f(sample: Sample) -> bool:
            return self.fn(sample) and other.fn(sample)

        return Query(f)

    def __or__(self, other) -> Query:
        def f(sample: Sample) -> bool:
            return self.fn(sample) or other.fn(sample)

        return Query(f)

    def __invert__(self) -> Query:
        def f(sample: Sample) -> bool:
            return not self.fn(sample)

        return Query(f)

    def __xor__(self, other) -> Query:
        def f(sample: Sample) -> bool:
            return self.fn(sample) ^ other.fn(sample)

        return Query(f)

    def __call__(self, sample: Sample) -> bool:
        return self.fn(sample)
