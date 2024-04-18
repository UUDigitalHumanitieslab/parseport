import { TestBed } from "@angular/core/testing";

import { SpindleApiService } from "./spindle-api.service";

describe("SpindleApiService", () => {
    let service: SpindleApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpindleApiService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
