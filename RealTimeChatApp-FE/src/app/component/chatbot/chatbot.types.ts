// Đây là một module nên chúng ta có thể khai báo global
declare global {
  interface Window {
    chatbase?: any;
  }
}

// Đảm bảo file là một module
export {};
