import { createAction, props } from '@ngrx/store';
import { Task } from '../../models/task.model';

export const loadTasks = createAction('[Tasks] Load Tasks');

export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: Task[] }>()
);

export const loadTasksFailure = createAction(
  '[Tasks] Load Tasks Failure',
  props<{ error: string }>()
);

export const loadMyTasks = createAction('[Tasks] Load My Tasks');

export const loadMyTasksSuccess = createAction(
  '[Tasks] Load My Tasks Success',
  props<{ tasks: Task[] }>()
);

export const loadMyTasksFailure = createAction(
  '[Tasks] Load My Tasks Failure',
  props<{ error: string }>()
);

export const createTask = createAction(
  '[Tasks] Create Task',
  props<{ task: Partial<Task> }>()
);

export const createTaskSuccess = createAction(
  '[Tasks] Create Task Success',
  props<{ task: Task }>()
);

export const createTaskFailure = createAction(
  '[Tasks] Create Task Failure',
  props<{ error: string }>()
);

export const updateTask = createAction(
  '[Tasks] Update Task',
  props<{ id: number; task: Partial<Task> }>()
);

export const updateTaskSuccess = createAction(
  '[Tasks] Update Task Success',
  props<{ task: Task }>()
);

export const updateTaskFailure = createAction(
  '[Tasks] Update Task Failure',
  props<{ error: string }>()
);

export const deleteTask = createAction(
  '[Tasks] Delete Task',
  props<{ id: number }>()
);

export const deleteTaskSuccess = createAction(
  '[Tasks] Delete Task Success',
  props<{ id: number }>()
);

export const deleteTaskFailure = createAction(
  '[Tasks] Delete Task Failure',
  props<{ error: string }>()
);

export const setFilter = createAction(
  '[Tasks] Set Filter',
  props<{ filter: 'all' | 'my-tasks' }>()
);

export const clearError = createAction('[Tasks] Clear Error');
