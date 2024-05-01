export type SpindleMode = "latex" | "pdf" | "overleaf" | "term-table" | "proof";

export interface SpindleInput {
    sentence: string;
    mode: SpindleMode;
}

// This should be the same as the one in the backend.
export const enum SpindleErrorSource {
    INPUT = "input",
    SPINDLE = "spindle",
    LATEX = "latex",
    GENERAL = "general",
}

type LexicalItem = {
    word: string;
    pos: string;
    pt: string;
    lemma: string;
};

export type LexicalPhrase = {
    items: LexicalItem[];
    type: string;
};

// Should correspond with SpindleResponse dataclass in backend.
export interface SpindleReturn {
    error: SpindleErrorSource | null;
    latex: string | null;
    pdf: string | null;
    redirect: string | null;
    term: string | null;
    lexical_phrases: LexicalPhrase[];
    proof: Record<string, unknown> | null;
}

export interface AethelSample {
    name: string;
    sentence: string;
}

export interface AethelReturnItem {
    lemma: string;
    word: string;
    type: string;
    samples: AethelSample[];
}

export interface AethelReturn {
    results: AethelReturnItem[];
    error: string | null;
}
