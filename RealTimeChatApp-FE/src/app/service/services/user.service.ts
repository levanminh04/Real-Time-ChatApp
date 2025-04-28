import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StrictHttpResponse } from '../strict-http-response';
import { UserResponse } from '../models/user-response';
import {ChatResponse} from '../models/chat-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Định nghĩa URL API cơ bản
  private readonly apiUrl = 'http://localhost:8080/api/v1/users';

  // Tiêm HttpClient vào constructor để sử dụng http.get(), http.post()
  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả người dùng ngoại trừ người dùng hiện tại.
   * Hàm không có hậu tố (ví dụ: getAllUsersExceptSelf) chỉ trả về phần thân dữ liệu (thường là UserResponse[]),
   * tức là phần dữ liệu chính mà bạn quan tâm, mà không bao gồm các thông tin phụ như headers hay status.
   * Hậu tố $Response là một quy ước thường thấy trong các công cụ sinh mã tự động (như ng-openapi-gen).
   * Nó giúp lập trình viên dễ dàng nhận biết hàm nào cung cấp phản hồi đầy đủ và hàm nào chỉ trả về dữ liệu,
   * từ đó chọn đúng hàm phù hợp với nhu cầu mà không cần đọc kỹ mã bên trong.
   */

  getAllUsersExceptSelf(context?: HttpContext): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl, { context });
  }

  /**
   * hậu tố $Response (ví dụ: getAllUsersExceptSelf$Response) trả về toàn bộ phản hồi HTTP,
   * bao gồm các thông tin như mã trạng thái (status), tiêu đề (headers), và phần thân dữ liệu (body).
   * Kiểu dữ liệu trả về thường là StrictHttpResponse, Nó khai báo rõ ràng kiểu dữ liệu mà HttpClient sẽ trả về. StrictHttpResponse<UserResponse[]> là một lớp bao bọc phản hồi HTTP, cho phép bạn truy cập các thuộc tính như body (dữ liệu), headers (tiêu đề), hay status (mã trạng thái).
   * HttpContext là một tính năng của Angular dùng để gắn thêm thông tin ngữ cảnh vào yêu cầu HTTP. Ví dụ:
   */
  getAllUsersExceptSelf$Response(context?: HttpContext): Observable<StrictHttpResponse<UserResponse[]>> {
    return this.http.get<StrictHttpResponse<UserResponse[]>>(this.apiUrl, { context });
  }

  searchUsersByKeyword(searchContent: string) {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/search`, {
      params: {
        'keyword': searchContent
      },
      headers: { Accept: 'application/json' }
    });
  }
}
