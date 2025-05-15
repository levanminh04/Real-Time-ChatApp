import {Component, input, InputSignal, output} from '@angular/core';
import {ChatResponse} from '../../service/models/chat-response';
import {UserResponse} from '../../service/models/user-response';
import {ChatService} from '../../service/services/chat.service';
import {UserService} from '../../service/services/user.service';
import {KeycloakService} from '../../../utils/keycloak/keycloak.service';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-chat-list',
  imports: [
    DatePipe,
    FormsModule
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
  searchContent: string = '';
  currentUser: InputSignal<UserResponse> = input<UserResponse>({});

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private keycloakService:KeycloakService
  ) {

  }

  searchContact() {
    console.log("getAllUsersExceptSelf đang chạy...")
    this.userService.getAllUsersExceptSelf()
      .subscribe({
        next: (users) => {
          this.contacts = users; // Cập nhật danh sách liên hệ
          this.searchNewContact = true; // Đặt cờ để chỉ ra rằng đã tìm kiếm liên hệ mới
          console.log(users)
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
    this.chatService.createChat(this.keycloakService.userIḍ as string
                                , contact.id as string)
      .subscribe({
        next:(res)=>{
          const chat: ChatResponse = {
            id : res.response,
            chatName:contact.firstName + " " + contact.lastName,
            recipientOnline: contact.online,
            lastMessageTime: contact.lastSeen,
            senderId: this.keycloakService.userIḍ,
            recipientId: contact.id
          };
          this.chats().unshift(chat); // chats() Đây là một InputSignal, thường được sử dụng để theo dõi và phản ứng với các thay đổi của dữ liệu. Khi gọi this.chats(), bạn đang lấy giá trị hiện tại của tín hiệu chats.
          // .unshift(chat): Đây là một phương thức của mảng trong JavaScript. Phương thức này thêm một phần tử mới (chat) vào ĐẦU mảng và thay đổi mảng gốc.
          this.searchNewContact = false;
          this.chatSelected.emit(chat); // hiển thi đoạn chat mới tạo

        }
      })
  }

  searchUsersByKeyword() {
    this.userService.searchUsersByKeyword(this.searchContent)
      .subscribe({
        next:(res)=>{
          this.contacts = res;
          this.searchNewContact = true;
        }
      })
  }
}
