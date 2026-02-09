import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../../core/models/auth.models';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ request: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: AuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Signup Actions
export const signup = createAction(
  '[Auth] Signup',
  props<{ request: SignupRequest }>()
);

export const signupSuccess = createAction(
  '[Auth] Signup Success',
  props<{ response: AuthResponse }>()
);

export const signupFailure = createAction(
  '[Auth] Signup Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Token Refresh
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ accessToken: string; refreshToken: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

// Load from Storage
export const loadAuthFromStorage = createAction('[Auth] Load From Storage');

export const loadAuthFromStorageSuccess = createAction(
  '[Auth] Load From Storage Success',
  props<{ user: User; accessToken: string; refreshToken: string }>()
);
