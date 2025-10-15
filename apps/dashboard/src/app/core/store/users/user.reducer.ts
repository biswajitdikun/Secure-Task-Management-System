import { createReducer, on } from '@ngrx/store';
import { UserState } from '../app.state';
import * as UserActions from './user.actions';

export const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null
};

export const userReducer = createReducer(
  initialState,
  
  on(UserActions.loadUsers, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    isLoading: false,
    error: null
  })),
  
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(UserActions.createUser, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(UserActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
    isLoading: false,
    error: null
  })),
  
  on(UserActions.createUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(UserActions.updateUser, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: state.users.map(u => u.id === user.id ? user : u),
    isLoading: false,
    error: null
  })),
  
  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(UserActions.deleteUser, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(UserActions.deleteUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.filter(u => u.id !== id),
    isLoading: false,
    error: null
  })),
  
  on(UserActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(UserActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);
