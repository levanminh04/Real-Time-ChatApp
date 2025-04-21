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
import {MessageRequest} from '../../service/models/message-request';
import SockJS from 'sockjs-client';

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
    this.initWebsocket();
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
  // chatSelected(chatResponse: ChatResponse) {
  //   this.selectedChat = chatResponse;
  //   this.getAllChatMessages(chatResponse.id as string);
  //   this.setMessagesToSeen();
  //   this.selectedChat.unreadCount = 0;
  // }
  chatSelected(chatResponse: ChatResponse) {
    this.selectedChat = chatResponse;
    console.log('Selected chat:', this.selectedChat);
    this.selectedChat.unreadCount = 0; // Reset unread count immediately visually

    this.messageService.getAllMessages(chatResponse.id as string).subscribe({    // getAllMessages là hàm bất đồng bộ nên cần nhét hết logic setToSeen vào getAllMessages, nếu không là getAllMessages chưa lấy dòng list message mà đã setToSeen là error
      next: (messages) => {
        this.chatMessages = messages;
        // --- Logic moved inside the 'next' callback ---
        const latestMessage = this.chatMessages && this.chatMessages.length > 0 ? this.chatMessages[this.chatMessages.length - 1] : null;
        const currentUserId = this.keycloakService.userIḍ as string;

        if (latestMessage && latestMessage.senderId !== currentUserId && latestMessage.state !== 'SEEN') {
          console.log('Calling setMessagesToSeen...');
          this.setMessagesToSeen(); // Call setMessagesToSeen only after messages are loaded and condition is met
        }
      },
      error: (err) => {
        console.error('Error fetching chat messages:', err);
        this.chatMessages = [];
      }
    });
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
        console.log('ok', this.chatMessages);
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
              createdAt: new Date().toString() // cách này hiển thị tạm thởi thôi, vì có thể lệch so với createAt trong database 1 vài giây, khoông nên gọi lại getALlChatMessages vì gây giảm hiệu suất, createAt sẽ được cập nhật lại trong lần gọi sau
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


  private initWebsocket() {
    if (this.keycloakService.keycloak.tokenParsed?.sub) {
      let ws = new SockJS('');
    }
  }
}
