import { Component } from "@angular/core";

@Component({
    selector: "pp-aethel",
    templateUrl: "./aethel.component.html",
    styleUrl: "./aethel.component.scss",
})
export class AethelComponent {
    items = [
        {
            word: "Aethel",
            type: "Car",
            frequency: 18,
        },
        {
            word: "Berzerk",
            type: "Bike",
            frequency: 15,
        },
        {
            word: "Flims",
            type: "Shoe",
            frequency: 20,
        },
    ];
}
