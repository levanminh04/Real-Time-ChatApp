import {Component, input, InputSignal, output} from '@angular/core';
import {ChatResponse} from '../../service/models/chat-response';
import {UserResponse} from '../../service/models/user-response';
import {ChatService} from '../../service/services/chat.service';
import {UserService} from '../../service/services/user.service';
import {KeycloakService} from '../../../utils/keycloak/keycloak.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [
    DatePipe
  ],
  templateUrl: './chat-list.component.html',
  standalone: true,
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {

  chats: InputSignal<ChatResponse[]> = input<ChatResponse[]>([]);
  searchNewContact: boolean = false;
  contacts:Array<UserResponse> = [];
  chatSelected = output<ChatResponse>();


  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private keycloakService:KeycloakService
  ) {

  }

  searchContact() {
    this.userService.getAllUsersExceptSelf()
      .subscribe({
        next: (users) => {
          this.contacts = users; // Cập nhật danh sách liên hệ
          this.searchNewContact = true; // Đặt cờ để chỉ ra rằng đã tìm kiếm liên hệ mới
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách người dùng:', error);
          // Có thể thêm thông báo lỗi cho người dùng, ví dụ: this.toastService.showError('Không thể tải danh sách liên hệ');
        }
      });
  }

  chatClicked(chatResponse: ChatResponse) {
    this.chatSelected.emit(chatResponse); // phát chatResponse đến component cha
  }

  wrapMessage(lastMessage: string | undefined) {
    if (lastMessage && lastMessage?.length < 20){
      return lastMessage;
    }
    else{
      return lastMessage?.substring(0, 17) + '...';
    }
  }

  formatMessageTime(messageTime: string | undefined):String {
    if (!messageTime) return '';

    const messageDate = new Date(messageTime)  // 2025-03-23T10:00:00
    const today = new Date();                  // 2025-03-23T10:00:00


    const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate()); // 2025-03-23
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());                 // 2025-03-23

    if(msgDate.getTime() === todayDate.getTime()){ // chỉ so sánh ngày, không so sánh giờ
      return messageDate.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12: true}); // 10:00 AM
    }
    else
    return messageDate.toLocaleDateString('en-US', {month:'short', day:'numeric'});       // Mar 03
  }

  getUnreadCountDisplay(unreadCount: number): string {
    return unreadCount > 5 ? '5+' : unreadCount.toString();
  }

  selectContact(contact: UserResponse) {

  }

}
