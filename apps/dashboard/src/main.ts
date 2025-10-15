import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { authReducer } from './app/core/store/auth/auth.reducer';
import { taskReducer } from './app/core/store/tasks/task.reducer';
import { userReducer } from './app/core/store/users/user.reducer';
import { AuthEffects } from './app/core/store/auth/auth.effects';
import { TaskEffects } from './app/core/store/tasks/task.effects';
import { UserEffects } from './app/core/store/users/user.effects';

bootstrapApplication(AppComponent, {
  providers: [
    // Set up routing
    provideRouter(routes),
    // Configure HTTP client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),
    // Enable animations
    provideAnimations(),
    // Configure NgRx store with our reducers
    provideStore({
      auth: authReducer,
      tasks: taskReducer,
      users: userReducer
    }),
    // Set up NgRx effects for side effects
    provideEffects([AuthEffects, TaskEffects, UserEffects]),
    // Enable Redux DevTools for debugging
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
    }),
  ],
}).catch(err => console.error(err));
