/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

export interface MessageRequest {
  chatId?: string;
  content?: string;
  messageType?: 'TEXT' | 'AUDIO' | 'VIDEO' | 'IMAGE';
  receiverId?: string;
  senderId?: string;
}
