import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SpindleMode } from "src/app/shared/services/api.service";

@Component({
    selector: "pp-export-button",
    templateUrl: "./export-button.component.html",
    styleUrls: ["./export-button.component.scss"],
})
export class ExportButtonComponent {
    @Output() export = new EventEmitter<SpindleMode | null>();
    @Input() mode: SpindleMode | null = null;
    @Input() isLoading = false;
    @Input() buttonText = $localize `Export`;
    @Input() textBelow: string | null = null;
}
