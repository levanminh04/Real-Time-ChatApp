import {HttpHeaders, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import Keycloak from 'keycloak-js';
import {KeycloakService} from '../keycloak/keycloak.service';


// req: Request HTTP hiện tại.   next: Hàm để chuyển request đến bước tiếp theo trong pipeline (gửi đến backend).

export const keycloakHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);
  const token = keycloakService.keycloak.token;
  if(token){
    const authReq = req.clone({ // Tạo một request mới, sao chép request cũ nhưng thêm Authorization Header. request cũ (req) sẽ không được sử dụng nữa sau khi interceptor trả về request mới
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`    //  Nếu KeycloakService có token hợp lệ, nó sẽ thêm Authorization Header vào request.
      })
    });
    return next(authReq);
  }
  return next(req);
};



// Trong Angular, HttpRequest là immutable (bất biến), nghĩa là bạn không thể chỉnh sửa trực tiếp request cũ.
// Thay vào đó, clone() tạo một bản sao của request, có thể thay đổi một số thuộc tính mà không làm mất request gốc.
// 🔹 req (request gốc) vẫn không thay đổi.
// 🔹 authReq là một request mới, giống req nhưng có thêm Authorization Header.

