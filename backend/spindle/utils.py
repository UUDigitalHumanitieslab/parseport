from aethel.frontend import LexicalPhrase


def serialize_phrases_with_infix_notation(
    lexical_phrases: list[LexicalPhrase],
) -> list[dict[str, str]]:
    """
    Serializes a list of LexicalPhrases in a human-readable infix notation that is already available in Æthel in Type.__repr__.

    The standard JSON serialization of phrases uses a prefix notation for types, which is good for data-exchange purposes (easier parsing) but less ideal for human consumption.
    """
    return [dict(phrase.json(), type=repr(phrase.type)) for phrase in lexical_phrases]
