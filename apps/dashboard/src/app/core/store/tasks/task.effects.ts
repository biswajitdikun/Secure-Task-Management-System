import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TaskService } from '../../services/task.service';
import * as TaskActions from './task.actions';

@Injectable()
export class TaskEffects {
  
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
          catchError((error) =>
            of(TaskActions.loadTasksFailure({ error: error.message || 'Failed to load tasks' }))
          )
        )
      )
    )
  );

  loadMyTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadMyTasks),
      switchMap(() =>
        this.taskService.getMyTasks().pipe(
          map((tasks) => TaskActions.loadMyTasksSuccess({ tasks })),
          catchError((error) =>
            of(TaskActions.loadMyTasksFailure({ error: error.message || 'Failed to load my tasks' }))
          )
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      switchMap(({ task }) =>
        this.taskService.createTask(task as any).pipe(
          map((createdTask) => TaskActions.createTaskSuccess({ task: createdTask })),
          catchError((error) =>
            of(TaskActions.createTaskFailure({ error: error.message || 'Failed to create task' }))
          )
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      switchMap(({ id, task }) =>
        this.taskService.updateTask(id, task).pipe(
          map((updatedTask) => TaskActions.updateTaskSuccess({ task: updatedTask })),
          catchError((error) =>
            of(TaskActions.updateTaskFailure({ error: error.message || 'Failed to update task' }))
          )
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      switchMap(({ id }) =>
        this.taskService.deleteTask(id).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id })),
          catchError((error) =>
            of(TaskActions.deleteTaskFailure({ error: error.message || 'Failed to delete task' }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private taskService: TaskService
  ) {}
}
