import { TestBed } from "@angular/core/testing";
import { HighlightPipe } from "./highlight.pipe";
import { DomSanitizer } from "@angular/platform-browser";

describe("HighlightPipe", () => {
    let pipe: HighlightPipe;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [{
                provide: DomSanitizer,
                useValue: {
                    bypassSecurityTrustHtml: (value: string) => value,
                },

            }]
        });
        const sanitizer = TestBed.inject(DomSanitizer);
        pipe = new HighlightPipe(sanitizer);
    });

    it("should create an instance", () => {
        expect(pipe).toBeTruthy();
    });

    it("should highlight the specified word in the input string", () => {
        const inputString = "Lorem ipsum dolor sit amet";
        const wordToHighlight = "ipsum";
        const expectedOutput = "Lorem <strong>ipsum</strong> dolor sit amet";

        const result = pipe.transform(inputString, wordToHighlight);

        expect(result).toEqual(expectedOutput);
    });

    it("should handle case-insensitive highlighting", () => {
        const inputString = "Lorem ipsum dolor sit amet";
        const wordToHighlight = "LOREM";
        const expectedOutput = "<strong>Lorem</strong> ipsum dolor sit amet";

        const result = pipe.transform(inputString, wordToHighlight);

        expect(result).toEqual(expectedOutput);
    });

    it("should handle multiple occurrences of the word to highlight", () => {
        const inputString =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ipsum ipsum ipsum.";
        const wordToHighlight = "ipsum";
        const expectedOutput =
            "Lorem <strong>ipsum</strong> dolor sit amet, consectetur adipiscing elit. Sed <strong>ipsum</strong> <strong>ipsum</strong> <strong>ipsum</strong>.";

        const result = pipe.transform(inputString, wordToHighlight);

        expect(result).toEqual(expectedOutput);
    });
});
