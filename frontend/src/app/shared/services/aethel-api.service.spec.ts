import { TestBed } from "@angular/core/testing";

import { AethelApiService } from "./aethel-api.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("AethelApiService", () => {
    let service: AethelApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(AethelApiService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
