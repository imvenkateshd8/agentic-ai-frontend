import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Signup
  on(AuthActions.signup, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.signupSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),

  on(AuthActions.signupFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Logout
  on(AuthActions.logoutSuccess, () => initialAuthState),

  // Token Refresh
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
    ...state,
    accessToken,
    refreshToken
  })),

  on(AuthActions.refreshTokenFailure, () => initialAuthState),

  // Load from Storage
  on(AuthActions.loadAuthFromStorageSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    accessToken,
    refreshToken,
    isAuthenticated: true
  }))
);
