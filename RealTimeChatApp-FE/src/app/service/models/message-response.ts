/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

export interface MessageResponse {
  content?: string;
  createdAt?: string;
  id?: number;
  media?: Array<string>; // kiểu string thì hợp lý hơn, media là một chuỗi Base64 đơn, không phải mảng.
  receiverId?: string;
  senderId?: string;
  state?: 'SENT' | 'SEEN';
  type?: 'TEXT' | 'AUDIO' | 'VIDEO' | 'IMAGE';
}
