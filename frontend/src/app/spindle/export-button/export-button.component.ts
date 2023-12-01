import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SpindleMode } from "src/app/shared/services/api.service";

@Component({
    selector: "dh-export-button",
    templateUrl: "./export-button.component.html",
    styleUrls: ["./export-button.component.scss"],
})
export class ExportButtonComponent {
    @Output() export = new EventEmitter<SpindleMode | null>();
    @Input() mode: SpindleMode | null = null;
    @Input() loading: SpindleMode | null = null;
    @Input() buttonText = "Export";
}
