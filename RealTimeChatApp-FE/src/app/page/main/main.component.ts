import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatListComponent} from '../../component/chat-list/chat-list.component';
import {ChatResponse} from '../../service/models/chat-response';
import {ChatService} from '../../service/services/chat.service';
import {KeycloakService} from '../../../utils/keycloak/keycloak.service';
import {MessageService} from '../../service/services/message.service';
import {MessageResponse} from '../../service/models/message-response';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';
import {EmojiData} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {MessageRequest} from '../../service/models/message-request';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import {Notification} from './models/notification';
import {AvatarModalComponentComponent} from '../../component/avatar-modal-component/avatar-modal-component.component';
import {UserResponse} from '../../service/models/user-response';
import {UserService} from '../../service/services/user.service';

@Component({
  selector: 'app-main',
  imports: [
    ChatListComponent,
    DatePipe,
    FormsModule,
    PickerComponent,
    AvatarModalComponentComponent
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy{

  chats: Array<ChatResponse> = [];
  selectedChat: ChatResponse = {}; // khai báo selectedChat là 1 ChatResponse - object rỗng, vì các thuộc tính của ChatResponse là tùy chọn ? nên khai báo này hợp lệ kể từ typescipt 4.0+
  chatMessages: Array<MessageResponse> = []; // MessageResponse[] = [];
  showEmojis = false;
  messageContent: string = '';
  private socketClient: any = null;
  @ViewChild('scrollableDiv') scrollableDiv!: ElementRef<HTMLDivElement>;

  private notificationSubscription: any;
  avatarModalVisible: boolean = false;
  currentUser:UserResponse={}

  constructor(
    private chatService: ChatService,
    private keycloakService: KeycloakService,
    private messageService: MessageService,
    private userService: UserService,
    ) {
  }



  ngOnInit(): void {
    this.getAllChats();
    this.initWebsocket();
    this.getCurrentUser();
  }


  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.scrollableDiv) {
      const div = this.scrollableDiv.nativeElement;
      div.scrollTop = div.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    if (this.socketClient !== null) {
      this.socketClient.disconnect();
      this.notificationSubscription.unsubscribe();
      this.socketClient = null;
    }
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

    const input = target as HTMLInputElement;
    if(input.files != null && input.files.length > 0){
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {      // .result trong đối tượng FileReader là thuộc tính lưu trữ kết quả của quá trình đọc file sau khi hoàn tất. Kiểu của result phụ thuộc vào phương thức đọc file mà bạn sử dụng
                                         // Với readAsText(): result là chuỗi văn bản, Với readAsArrayBuffer(): result là ArrayBuffer
        if(reader.result){               // Khi sử dụng readAsDataURL(), result sẽ có định dạng: data:[<mediatype>][;base64],<data>
          const base64ImageString = reader.result.toString().split(',')[1];  // .toString() chuyển đổi thành string (để chắc chắn), .split(',')[1] tách chuỗi tại dấu phẩy và lấy phần thứ hai, Kết quả là chuỗi base64 thuần túy (phần /9j/4AAQ...) không có prefix data:image/jpeg;base64,
          this.messageService.uploadMediaMessage(
            this.selectedChat.id as string, file
          ).subscribe({
            next: ()=>{
              const message: MessageResponse = {
                senderId: this.getSenderId(),
                receiverId: this.getReceiverId(),
                content: 'Attachment',
                type:'IMAGE',
                state:'SENT',
                media:[base64ImageString],
                createdAt:new Date().toString()
              }
              this.chatMessages.push(message) // thêm vào cuối mảng
            }
          })
        }

      }
      reader.readAsDataURL(file);  // hàm này đọc xong thì reader.onload mới thực thi
    }
  }


  private extractFileFromTarget(target: EventTarget | null): File | null {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }
    return htmlInputTarget.files[0];
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

  /**
   * Khởi tạo kết nối WebSocket để nhận tin nhắn thời gian thực
   * WebSocket cho phép server chủ động gửi thông báo đến client mà không cần client polling
   */
  private initWebsocket() {
    // Kiểm tra người dùng đã đăng nhập hay chưa thông qua JWT token
    // sub (subject) là thuộc tính chứa ID người dùng trong JWT token
    if (this.keycloakService.keycloak.tokenParsed?.sub) {

      // Bước 1: Tạo kết nối WebSocket thô sử dụng SockJS
      // SockJS cung cấp WebSocket-like object với fallback cho các trình duyệt cũ
      // Endpoint '/ws' được cấu hình trong Spring Boot backend
      let ws = new SockJS('http://localhost:8080/ws');

      // Bước 2: Bọc SockJS connection bằng STOMP protocol
      // STOMP (Streaming Text Oriented Messaging Protocol) cung cấp:
      // - Message framing và định dạng tin nhắn
      // - Pub/Sub messaging pattern
      // - Khả năng subscribe vào nhiều destination khác nhau
      this.socketClient = Stomp.over(ws);

      // Bước 3: Tạo URL subscription dành riêng cho user hiện tại
      // Pattern: /user/{userId}/chat - mỗi user có một channel riêng
      // Server sẽ gửi thông báo đến đúng user thông qua URL này
      const subUrl = `/user/${this.keycloakService.keycloak.tokenParsed?.sub}/chat`;

      // Bước 4: Thiết lập kết nối STOMP với JWT token để xác thực
      // Header 'Authorization: Bearer {token}' được gửi kèm để server verify user
      this.socketClient.connect(
        {'Authorization': 'Bearer ' + this.keycloakService.keycloak.token},

        // Success callback - được gọi khi kết nối thành công
        () => {
          // Bước 5: Subscribe vào channel của user để nhận thông báo
          // Khi có tin nhắn mới, server sẽ gửi notification đến channel này
          this.notificationSubscription = this.socketClient.subscribe(
            subUrl,

            // Message handler - xử lý khi nhận được thông báo từ server
            (message: any) => {
              console.log('Nhận được tin nhắn WebSocket:', message);

              // Parse JSON từ message body thành object Notification
              // Backend gửi các loại notification: MESSAGE, IMAGE, SEEN
              const notification: Notification = JSON.parse(message.body);
              console.log('Bắt đầu xử lý thông báo...', notification);

              // Gọi handler để cập nhật UI dựa trên loại notification
              this.handleNotification(notification);
              console.log('Đã xử lý xong thông báo');
            },

            // Error callback - xử lý lỗi khi subscribe
            () => console.error('Lỗi khi kết nối WebSocket hoặc subscribe channel')
          );
        },

        // Connection error callback - xử lý lỗi khi connect
        (error: any) => {
          console.error('Lỗi khi thiết lập kết nối WebSocket:', error);
        }
      );
    }
  }


  /**
   * Xử lý các thông báo nhận được từ WebSocket
   * Cập nhật UI theo thời gian thực dựa trên loại thông báo và trạng thái hiện tại
   *
   * @param notification - Object chứa thông tin về tin nhắn/sự kiện từ server
   */
  private handleNotification(notification: Notification) {
    // Kiểm tra notification có hợp lệ không
    if (!notification) return;

    // TRƯỜNG HỢP 1: Thông báo thuộc về cuộc trò chuyện đang được chọn
    // → Cập nhật trực tiếp trong chat hiện tại
    if (this.selectedChat && this.selectedChat.id === notification.chatId) {
      console.log('Thông báo thuộc chat đang được chọn');
      console.log('Loại thông báo:', notification.notificationType);

      switch (notification.notificationType) {

        // Xử lý tin nhắn văn bản và hình ảnh
        case 'MESSAGE':
        case 'IMAGE':
          // Tạo object MessageResponse từ notification để hiển thị trong chat
          const message: MessageResponse = {
            senderId: notification.senderId,
            receiverId: notification.recipientId,
            content: notification.content,
            type: notification.messageType,    // 'TEXT' hoặc 'IMAGE'
            media: notification.media,         // Mảng chứa base64 image nếu là IMAGE
            createdAt: new Date().toString()   // Timestamp hiện tại
          };

          // Cập nhật tin nhắn cuối cùng trong chat header
          if (notification.notificationType === 'IMAGE') {
            this.selectedChat.lastMessage = 'Attachment'; // Hiển thị "Attachment" thay vì nội dung image
          } else {
            this.selectedChat.lastMessage = notification.content; // Hiển thị nội dung tin nhắn
          }

          // Debug: Theo dõi số lượng tin nhắn trước và sau khi thêm
          console.log('Số tin nhắn trước khi thêm:', this.chatMessages.length);

          // Thêm tin nhắn mới vào cuối danh sách để hiển thị trong chat
          this.chatMessages.push(message);

          console.log('Số tin nhắn sau khi thêm:', this.chatMessages.length);
          break;

        // Xử lý thông báo "đã xem" tin nhắn
        case 'SEEN':
          // Đánh dấu tất cả tin nhắn trong chat hiện tại là đã xem
          // Thay đổi icon từ "sent" (✓) thành "seen" (✓✓)
          this.chatMessages.forEach(m => m.state = 'SEEN');
          break;
      }

    }
    // TRƯỜNG HỢP 2: Thông báo thuộc về cuộc trò chuyện khác (không đang được chọn)
    // → Cập nhật danh sách chat và badge thông báo
    else {

      // Tìm chat trong danh sách dựa trên chatId
      const destChat = this.chats.find(c => c.id === notification.chatId);

      // Nếu tìm thấy chat và không phải thông báo "SEEN"
      if (destChat && notification.notificationType !== 'SEEN') {

        // Cập nhật tin nhắn cuối cùng hiển thị trong danh sách chat
        if (notification.notificationType === 'MESSAGE') {
          destChat.lastMessage = notification.content;
        } else if (notification.notificationType === 'IMAGE') {
          destChat.lastMessage = 'Attachment';
        }

        // Cập nhật thời gian tin nhắn cuối cùng
        destChat.lastMessageTime = new Date().toString();

        // Tăng số lượng tin nhắn chưa đọc
        destChat.unreadCount! += 1;
      }

      // TRƯỜNG HỢP 3: Tin nhắn từ cuộc trò chuyện mới (chưa tồn tại trong danh sách)
      // → Tạo chat mới và thêm vào đầu danh sách
      else if (notification.notificationType === 'MESSAGE') {

        // Tạo object ChatResponse mới từ thông tin trong notification
        const newChat: ChatResponse = {
          id: notification.chatId,
          senderId: notification.senderId,
          recipientId: notification.recipientId,
          lastMessage: notification.content,
          chatName: notification.chatName,        // Tên hiển thị của cuộc trò chuyện
          unreadCount: 1,                        // Bắt đầu với 1 tin nhắn chưa đọc
          lastMessageTime: new Date().toString()
        };

        // Thêm chat mới vào đầu danh sách (tin nhắn mới nhất lên trên)
        this.chats.unshift(newChat);
      }
    }
  }


  openAvatarModal() {
    this.avatarModalVisible = true;
  }

  onAvatarUpdated(newAvatarUrl: string) {
    this.currentUser.avatarUrl = newAvatarUrl;
    this.avatarModalVisible = false;
  }

  private getCurrentUser() {
    this.userService.getCurrentUser()
      .subscribe({
        next:(res)=>{
          this.currentUser = res;
          console.log('currentUser: ', res)
        },
        error: (err) => {
          console.error('Lỗi khi gọi API getCurrentUser:', err);
        }
      })

  }
}
