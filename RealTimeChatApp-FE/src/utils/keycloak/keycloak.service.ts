import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import {Router} from '@angular/router';

@Injectable({ //  @Injectable đánh dấu một class là Service có thể được inject vào các thành phần khác.
  providedIn: 'root'     // providedIn: 'root' thể hiện Service này sẽ được tạo duy nhất một lần (singleton) và có thể dùng ở mọi component.
})

export class KeycloakService {

  private _keycloak: Keycloak | undefined;   // Ban đầu có thể là undefined, nhưng sau đó sẽ được khởi tạo khi gọi getter.

  constructor(private router: Router) {  //  Constructor là nơi duy nhất Angular cho phép inject dependencies bằng Dependency Injection (DI)
      // router là một service của Angular, thuộc hệ thống Dependency Injection (DI). Angular chỉ có thể inject dependencies vào constructor chứ không thể tự động cung cấp chúng khi khai báo như một thuộc tính thông thường.
      // service do Angular quản lý → không thể khởi tạo bằng new Router().
  }

  // private router: Router; // Nếu không inject vào constructor thì phải khai báo như thế này, private router: Router giúp  Tự động gán router thành thuộc tính của class KeycloakService
  // private router: Router;
  // constructor(router: Router) {
  //   this.router = router; // ✅ Phải gán thủ công
  // }

  get keycloak(){
    if(!this._keycloak){     // !undefined = true
      this._keycloak = new Keycloak({
        url: 'http://localhost:9090',    // Quá trình khởi tạo Keycloak chỉ đơn thuần là tạo một đối tượng trong bộ nhớ, chưa có request nào gửi đến keycloak server. chỉ có request khi gọi đến init(), login(),...
        realm: 'Real-time-chat-app',
        clientId: 'real-time-chat-app'
        // redirectUri: 'http://localhost:4200/home'
      });
    }
    return this._keycloak;
  }

    async init(){
      const authenticated = await this.keycloak.init({    // this.keycloak ở đây là getter trả về đối tượng Đối tượng Keycloak, đối tượng này cung cấp các hàm như init(), login(), logout(), accountManagement(), hasRealmRole()...
        onLoad: 'login-required',
      })
      if (authenticated) {
        console.log("Người dùng đã đăng nhập!");
      } else {
        console.log("Người dùng chưa đăng nhập!");
      }
    }


    async login(){
      await this.keycloak.login()
    }

    async logout() {
      await this.keycloak.logout({redirectUri: 'http://localhost:4200'});
    }

    accountManagement(){
      return this.keycloak.accountManagement(); // accountManagement() giúp mở trang quản lý tài khoản của người dùng trong Keycloak
    }

  get userIḍ(): string{
      return this.keycloak?.tokenParsed?.sub as string;  // tokenParsed là một đối tượng chứa dữ liệu giải mã từ JWT (JSON Web Token).
    }

    get isTokenValid():boolean{
      return !this.keycloak.isTokenExpired();
    }

    get fullName(): string{
      return this.keycloak.tokenParsed?.['name'] as string;
    }

  // Dấu '?.' (not '?') giúp tránh lỗi "Cannot read property of undefined". Nếu this.keycloak hoặc this.keycloak.tokenParsed không tồn tại, nó sẽ trả về undefined thay vì gây lỗi. Nó hoạt động như if-else: nếu biến phía trước '?.' là null hoặc undefined, toàn bộ biểu thức sẽ trả về undefined.
  // as string ép kiểu (Type Assertion) để đảm bảo sub có kiểu string vì có thể  TypeScript không chắc chắn kiểu của sub


}
