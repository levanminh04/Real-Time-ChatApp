/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ChatResponse } from '../models/chat-response';
import { createChat } from '../fn/chat/create-chat';
import { CreateChat$Params } from '../fn/chat/create-chat';
import { getAllChats } from '../fn/chat/get-all-chats';
import { GetAllChats$Params } from '../fn/chat/get-all-chats';
import { StringResponse } from '../models/string-response';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/chats';

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả các cuộc trò chuyện của người dùng hiện tại
   */
  getAllChats(): Observable<ChatResponse[]> {
    return this.http.get<ChatResponse[]>(this.baseUrl, {
      headers: { Accept: 'application/json' }
    });
  }

  /**
   * Tạo một cuộc trò chuyện mới giữa hai người dùng
   */
  createChat(senderId: string, receiverId: string): Observable<StringResponse> {
    return this.http.post<StringResponse>(this.baseUrl, null, {
      params: {
        'sender-id': senderId,
        'receiver-id': receiverId
      },
      headers: { Accept: 'application/json' }
    });
  }
}
