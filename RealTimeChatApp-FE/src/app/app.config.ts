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












// 1. Angular starts bootstrapping
//         ↓
// 2. Angular processes providers
//         ↓
// 3. provideAppInitializer(initializeKeycloak) được gọi
//         ↓
// 4. initializeKeycloak() function được thực thi
//         ↓
// 5. keycloakService.init() được gọi NGAY LẬP TỨC
//         ↓
// 6. keycloak.init({onLoad: 'login-required'}) thực thi
//         ↓
// 7. Nếu chưa có token → REDIRECT đến Keycloak login
//         ↓ (User đăng nhập)
// 8. Sau khi có token → Angular tiếp tục khởi động
//         ↓
// 9. AppComponent được render
//         ↓
// 10. Các component khác được khởi tạo
//
// Angular sẽ CHỜ keycloakService.init() hoàn thành
// KHÔNG render bất kỳ component nào cho đến khi Promise resolve
// Nếu Promise reject → Angular app KHÔNG khởi động
//




// User opens http://localhost:4200
//   ↓
// Angular app khởi động
//         ↓
// initializeKeycloak() được gọi
//         ↓
// keycloak.init({onLoad: 'login-required'})
//         ↓
// Kiểm tra có token trong browser? → KHÔNG (Keycloak-js đảm nhận việc check token)
//         ↓
// Redirect đến Keycloak login page
//         ↓
// User nhập username/password
//         ↓
// Keycloak xác thực → Tạo authorization code
//         ↓
// Redirect về Angular: /?code=abc123
//         ↓
// Keycloak JS đổi code → access_token
//         ↓
// Lưu token vào memory + storage
//         ↓
// Angular app hiển thị main component
//         ↓
// Mỗi HTTP request tự động có Bearer token


// Giao diện người dùng của Keycloak được host trên máy chủ Keycloak riêng biệt, không nằm trong ứng dụng Spring Boot.
// Khi user đăng nhập, họ sẽ được chuyển hướng đến server Keycloak (URL bên ngoài), sau đó quay lại ứng dụng của bạn với token.


// Dữ liệu được gửi TRỰC TIẾP đến Keycloak Server
