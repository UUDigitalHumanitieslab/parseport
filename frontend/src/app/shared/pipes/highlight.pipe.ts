import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
    name: "highlight",
})
export class HighlightPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string, word: string): SafeHtml {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const highlighted = value.replace(regex, '<strong>$&</strong>');
        return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }
}
