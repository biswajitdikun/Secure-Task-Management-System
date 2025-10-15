import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have login method', () => {
    expect(service.login).toBeDefined();
  });

  it('should have register method', () => {
    expect(service.register).toBeDefined();
  });

  it('should have logout method', () => {
    expect(service.logout).toBeDefined();
  });
});
