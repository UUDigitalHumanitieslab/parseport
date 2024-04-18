import { TestBed } from "@angular/core/testing";

import { AethelApiService } from "./aethel-api.service";

describe("AethelApiService", () => {
    let service: AethelApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AethelApiService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
