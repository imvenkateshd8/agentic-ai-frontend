import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { chatReducer } from './store/chat/chat.reducer';
import { documentReducer } from './store/document/document.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ChatEffects } from './store/chat/chat.effects';
import { DocumentEffects } from './store/document/document.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          // Auth interceptor functional approach
          const token = localStorage.getItem('access_token');
          if (token) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          return next(req);
        }
      ])
    ),
    provideStore({
      auth: authReducer,
      chat: chatReducer,
      document: documentReducer
    }),
    provideEffects([AuthEffects, ChatEffects, DocumentEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75
    })
  ]
};
