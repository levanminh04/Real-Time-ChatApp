import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { KeycloakService } from '../utils/keycloak/keycloak.service';
import { HttpClient } from '@angular/common/http';
import './chatbase.types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'RealTimeChatApp-FE';
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private keycloakService: KeycloakService,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChatbaseWidget();
    }
  }
  
  private loadChatbaseWidget(): void {
    // Sử dụng chính xác mã script từ Chatbase đã cung cấp
    const script = document.createElement('script');
    script.id = 'chatbase-script';
    script.textContent = `
      (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="1JVXJkDjh9HcM1vYNZtdj";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
    `;
    document.head.appendChild(script);
    
    // Không cần thêm script embed vì đã được xử lý trong mã trên
    
    // Thêm xác thực người dùng (tùy chọn)
    if (this.isAuthenticated()) {
      this.addIdentityVerification();
    }
  }
  private isAuthenticated(): boolean {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    return !!this.keycloakService.keycloak.tokenParsed?.sub;
  }

  private addIdentityVerification(): void {
    const userId = this.keycloakService.keycloak.tokenParsed?.sub as string;
    
    // Gọi API backend để lấy HMAC cho xác thực
    // Lưu ý: Bạn cần tạo API endpoint này ở backend để tạo HMAC với secret key
    this.http.post<{hmac: string}>('/api/v1/chatbase/verification', { userId })
      .subscribe({
        next: (response) => {
          if (window.chatbase) {
            // Thêm thông tin xác thực người dùng
            window.chatbase('config', {
              identityVerification: {
                userId: userId,
                hmac: response.hmac
              }
            });
          }
        },
        error: (err) => {
          console.error('Không thể lấy HMAC cho Chatbase:', err);
          
          // Vẫn khởi tạo chatbot mà không có xác thực
          if (window.chatbase) {
            window.chatbase('config', {});
          }
        }
      });
  }
}
