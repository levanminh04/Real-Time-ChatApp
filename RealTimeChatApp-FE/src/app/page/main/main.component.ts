import {Component, OnInit} from '@angular/core';
import {ChatListComponent} from '../../component/chat-list/chat-list.component';
import {ChatResponse} from '../../service/models/chat-response';
import {ChatService} from '../../service/services/chat.service';
import {KeycloakService} from '../../../utils/keycloak/keycloak.service';
import {MessageService} from '../../service/services/message.service';
import {MessageResponse} from '../../service/models/message-response';

@Component({
  selector: 'app-main',
  imports: [
    ChatListComponent
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{

  chats: Array<ChatResponse> = [];
  selectedChat: ChatResponse = {}; // khai báo selectedChat là 1 ChatResponse - object rỗng, vì các thuộc tính của ChatResponse là tùy chọn ? nên khai báo này hợp lệ kể từ typescipt 4.0+
  private chatMessages: Array<MessageResponse> = []; // MessageResponse[] = [];



  constructor(
    private chatService: ChatService,
    private keycloakService: KeycloakService,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.getAllChats();
  }

  private getAllChats(){
    this.chatService.getAllChats()
      .subscribe({
        next: (res) => {
          this.chats = res;
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

}
