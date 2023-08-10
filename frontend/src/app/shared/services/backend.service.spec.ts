import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BackendService } from './backend.service';

describe('BackendService', () => {

  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientTestingModule] }));

    it('should be created', () => {
        const service = TestBed.inject(BackendService);
        expect(service).toBeTruthy();
    });
});
