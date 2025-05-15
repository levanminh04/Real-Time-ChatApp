import {ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {KeycloakService} from '../utils/keycloak/keycloak.service';
import {keycloakHttpInterceptor} from '../utils/http/keycloak-http.interceptor';


export function initializeKeycloak(){
  const keycloakService = inject(KeycloakService);
  return keycloakService.init();
}

export const appConfig: ApplicationConfig = { // ApplicationConfig là kiểu dữ liệu của Angular giúp khai báo các provider cấp cao nhất (Global Providers).
  providers: [ //  Mảng providers chứa danh sách các dependency cần thiết cho ứng dụng.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),  // cung cấp RouterModule trong Standalone API
    provideHttpClient( // provideHttpClient cung cấp HttpClient
      withInterceptors([keycloakHttpInterceptor])
    ),
    provideAppInitializer(initializeKeycloak) // provideAppInitializer cần một HÀM trả về một Promise hoặc void để nó tự gọi khi cần., chứ không phải kết quả của hàm
  ]                                           // initializeKeycloak trả về hàm có thể được gọi sau này not trả về kết quả của hàm còn initializeKeycloak() trả về kết quả của hàm
};





