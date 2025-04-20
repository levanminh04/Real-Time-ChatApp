import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageRequest } from '../models/message-request';
import { MessageResponse } from '../models/message-response';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/messages';

  constructor(private http: HttpClient) {}

  // Lưu một tin nhắn mới
  saveMessage(body: MessageRequest): Observable<void> { // Xác định kiểu dữ liệu (type) của body là MessageRequest, body bắt buộc phải có cấu trúc đúng kiểu MessageRequest.
    return this.http.post<void>(this.baseUrl, body, {
      headers: { 'Content-Type': 'application/json' }, //  server hiểu rằng body của request đang ở định dạng JSON
    });
  }

  // Đánh dấu tin nhắn là đã xem
  setMessageToSeen(chatId: string): Observable<void> {
    return this.http.patch<void>(this.baseUrl, null, {
      params: { 'chat-id': chatId },  // truyền qua param, backend yêu cầu @RequestParam('chat-id')
    });
  }
  // Tải lên media cho tin nhắn
  uploadMediaMessage(chatId: string, file: Blob): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.baseUrl}/media`, formData, {
      params: { 'chat-id': chatId },   // truền qua param
      headers: { Accept: '*/*' }, // Không cần Content-Type vì FormData tự xử lý
    });
  }

  // Lấy tất cả tin nhắn trong một chat
  getAllMessages(chatId: string): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${this.baseUrl}/chat/${chatId}`, {
      headers: { Accept: 'application/json' },
    });
  }

}
