import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import './chatbot.types';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements AfterViewInit, OnDestroy {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChatbaseScript();
    }
  }

  ngOnDestroy(): void {
    // Remove chatbase script when component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      const chatbaseScript = document.getElementById('chatbase-script');
      if (chatbaseScript) {
        chatbaseScript.remove();
      }
    }
  }

  private loadChatbaseScript(): void {
    // Check if script already exists
    if (document.getElementById('chatbase-script')) {
      return;
    }

    // === VỊ TRÍ 1: CHÈN MÃ KHỞI TẠO CHATBASE ===
    // Thay thế dòng bên dưới với mã script từ Chatbase (dòng <script> đầu tiên từ hình ảnh)
    const script = document.createElement('script');
    script.id = 'chatbase-script';
    script.textContent = `
      (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=function(){window.chatbase.q.push(arguments)};window.chatbase.q=[];}})();
    `;
    document.head.appendChild(script);

    // Thêm script embed của Chatbase
    const chatbaseScript = document.createElement('script');
    chatbaseScript.src = 'https://www.chatbase.co/embed.min.js';
    chatbaseScript.defer = true;
    document.head.appendChild(chatbaseScript);

    // === VỊ TRÍ 2: CẤU HÌNH CHATBOT ID ===
    // Thay "YOUR_CHATBOT_ID_HERE" bằng ID chatbot của bạn từ trang Chatbase
    setTimeout(() => {
      if (window.chatbase) {
        window.chatbase('config', {
          chatbotId: 'YOUR_CHATBOT_ID_HERE'
        });
      }
    }, 1000);
  }
}
