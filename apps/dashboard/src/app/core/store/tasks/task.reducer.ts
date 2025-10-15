import { createReducer, on } from '@ngrx/store';
import { TaskState } from '../app.state';
import * as TaskActions from './task.actions';

export const initialState: TaskState = {
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: null,
  filter: 'all'
};

export const taskReducer = createReducer(
  initialState,
  
  on(TaskActions.loadTasks, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(TaskActions.loadMyTasks, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.loadMyTasksSuccess, (state, { tasks }) => ({
    ...state,
    myTasks: tasks,
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.loadMyTasksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(TaskActions.createTask, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
    myTasks: [...state.myTasks, task],
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.createTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(TaskActions.updateTask, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t.id === task.id ? task : t),
    myTasks: state.myTasks.map(t => t.id === task.id ? task : t),
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(TaskActions.deleteTask, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== id),
    myTasks: state.myTasks.filter(t => t.id !== id),
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(TaskActions.setFilter, (state, { filter }) => ({
    ...state,
    filter
  })),
  
  on(TaskActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);
