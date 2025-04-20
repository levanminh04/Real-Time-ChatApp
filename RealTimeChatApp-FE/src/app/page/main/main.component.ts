import {Component, OnInit} from '@angular/core';
import {ChatListComponent} from '../../component/chat-list/chat-list.component';
import {ChatResponse} from '../../service/models/chat-response';
import {ChatService} from '../../service/services/chat.service';
import {KeycloakService} from '../../../utils/keycloak/keycloak.service';
import {MessageService} from '../../service/services/message.service';
import {MessageResponse} from '../../service/models/message-response';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';
import {EmojiData} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {setMessageToSeen} from '../../service/fn/message/set-message-to-seen';
import normalizeExternalHTML from 'quill/modules/normalizeExternalHTML';
import {MessageRequest} from '../../service/models/message-request';

@Component({
  selector: 'app-main',
  imports: [
    ChatListComponent,
    DatePipe,
    FormsModule,
    PickerComponent
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{

  chats: Array<ChatResponse> = [];
  selectedChat: ChatResponse = {}; // khai báo selectedChat là 1 ChatResponse - object rỗng, vì các thuộc tính của ChatResponse là tùy chọn ? nên khai báo này hợp lệ kể từ typescipt 4.0+
  chatMessages: Array<MessageResponse> = []; // MessageResponse[] = [];
  showEmojis = false;
  messageContent: string = '';


  constructor(
    private chatService: ChatService,
    private keycloakService: KeycloakService,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.getAllChats();
  }

  private getAllChats(){
    console.log('getAllChats đang được gọi');
    this.chatService.getAllChats()
      .subscribe({
        next: (res) => {
          console.log('Kết quả API:', res);
          this.chats = res;
        },
        error: (err) => {
          console.error('Lỗi khi gọi API getAllChats:', err);
        }
      });
  }

  chatSelected(chatResponse: ChatResponse) {
    this.selectedChat = chatResponse;
    this.getAllChatMessages(chatResponse.id as string);
    this.setMessagesToSeen();
    this.selectedChat.unreadCount = 0;
  }

  private setMessagesToSeen() {
    this.messageService.setMessageToSeen(
      this.selectedChat.id as string
    ).subscribe({
        next: () =>{}
      });
  }

  private getSenderId(){
    if(this.selectedChat.senderId === this.keycloakService.userIḍ){
      return this.keycloakService.userIḍ as string;
    }
    return this.selectedChat.recipientId as string;
  }

  private getReceiverId(){
    if(this.selectedChat.senderId === this.keycloakService.userIḍ){
      return this.selectedChat.recipientId as string;
    }
    return this.selectedChat.senderId as string;
  }


  private getAllChatMessages(chatId: string) {
    this.messageService.getAllMessages(chatId).subscribe({
      next: (messages) => {
        this.chatMessages = messages;
      }
    });
  }


  userProfile() {
    this.keycloakService.accountManagement();
  }

  logout(){
    this.keycloakService.logout();
  }

  isSelfMessage(message: MessageResponse) {
    return message.senderId === this.keycloakService.userIḍ;
  }

  uploadMedia(target: EventTarget | null) {

  }

  keyDown($event: KeyboardEvent) {
    const pressedKey = $event.key
    if(pressedKey === 'Enter'){
      this.sendMessage()
    }
  }

  onClick() {
    this.setMessagesToSeen()
  }

  sendMessage() {
    if(this.messageContent){
      const messageRequest: MessageRequest = {
        chatId: this.selectedChat.id,
        messageType: 'TEXT',
        receiverId: this.getReceiverId(),
        senderId: this.getSenderId(),
        content: this.messageContent,
      }
      this.messageService.saveMessage(messageRequest)
        .subscribe({
          next:() => {
            const messageResponse: MessageResponse = {
              senderId: this.getSenderId(),
              receiverId: this.getReceiverId(),
              state: 'SENT',
              content: this.messageContent,
              type: 'TEXT',
              createdAt: new Date().toString() // cách này hiển thị tạm thời thôi, vì có thể lệch so với createAt trong database 1 vài giây, khoông nên gọi lại getALlChatMessages vì gây giảm hiệu suất, createAt sẽ được cập nhật lại trong lần gọi sau
            }
            this.selectedChat.lastMessage = this.messageContent
            this.messageContent = ''
            this.chatMessages.push(messageResponse)
            this.showEmojis = false // trong trường hợp đang mở emoji pannel thì cần tắt pannel sau khi send
          }
        })
    }
  }

  onSelectEmojis($event: any) {
    const emoji: EmojiData = $event.emoji
    this.messageContent += emoji.native;
  }


}
