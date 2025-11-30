import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.state';

// Feature selectors
export const selectAuthState = createFeatureSelector<AppState['auth']>('auth');
export const selectTaskState = createFeatureSelector<AppState['tasks']>('tasks');
export const selectUserState = createFeatureSelector<AppState['users']>('users');

// Auth selectors
export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

// Task selectors
export const selectAllTasks = createSelector(
  selectTaskState,
  (state) => state.tasks
);

export const selectMyTasks = createSelector(
  selectTaskState,
  (state) => state.myTasks
);

export const selectTaskFilter = createSelector(
  selectTaskState,
  (state) => state.filter
);

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectMyTasks,
  selectTaskFilter,
  (allTasks, myTasks, filter) => {
    return filter === 'all' ? allTasks : myTasks;
  }
);

export const selectTaskLoading = createSelector(
  selectTaskState,
  (state) => state.isLoading
);

export const selectTaskError = createSelector(
  selectTaskState,
  (state) => state.error
);

// User selectors
export const selectAllUsers = createSelector(
  selectUserState,
  (state) => state.users
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state) => state.isLoading
);

export const selectUserError = createSelector(
  selectUserState,
  (state) => state.error
);

// Combined selectors
export const selectCurrentUserRole = createSelector(
  selectUser,
  (user) => user?.role
);

