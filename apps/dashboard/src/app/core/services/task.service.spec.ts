import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getTasks method', () => {
    expect(service.getTasks).toBeDefined();
  });

  it('should have createTask method', () => {
    expect(service.createTask).toBeDefined();
  });

  it('should have updateTask method', () => {
    expect(service.updateTask).toBeDefined();
  });

  it('should have deleteTask method', () => {
    expect(service.deleteTask).toBeDefined();
  });
});
