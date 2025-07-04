

(window as any).global = window;


/**
 * WINDOW GLOBAL FIX - Khắc phục lỗi tương thích Node.js libraries trong Angular
 * 
 * VẤN ĐỀ:
 * --------
 * - Nhiều thư viện Node.js (như SockJS, StompJS) được thiết kế để chạy trong môi trường Node.js
 * - Các thư viện này sử dụng biến toàn cục `global` để truy cập vào global scope
 * - Trong Node.js: `global` là đối tượng toàn cục chính
 * - Trong trình duyệt: `window` là đối tượng toàn cục chính, KHÔNG có `global`
 * 
 * LỖI KHI KHÔNG CÓ FIX NÀY:
 * -------------------------
 * ReferenceError: global is not defined
 *   at Object.<anonymous> (sockjs-client.js:123)
 *   at Module._compile (module.js:456)
 *   at webpack:///./node_modules/sockjs-client/lib/main.js
 * 
 * NGUYÊN NHÂN CỤ THỂ TRONG DỰ ÁN:
 * --------------------------------
 * 1. SockJS-client: Thư viện WebSocket fallback, kiểm tra `global.location` để xác định môi trường
 * 2. StompJS: Protocol messaging qua WebSocket, sử dụng `global` để lưu trữ các biến môi trường
 * 3. Keycloak-js: Có thể gián tiếp sử dụng các thư viện phụ thuộc vào `global`
 * 
 * GIẢI PHÁP:
 * ----------
 * Gán `window.global = window` để:
 * - Tạo thuộc tính `global` trên đối tượng `window`
 * - Trỏ `global` về chính `window` (vì window chính là global scope trong browser)
 * - Các thư viện Node.js sẽ tìm thấy `global` và sử dụng nó như bình thường
 * 
 * CÁCH HOẠT ĐỘNG:
 * ---------------
 * Trước fix: global → undefined → ReferenceError
 * Sau fix:  global → window → hoạt động bình thường
 * 
 * ĐIỀU KIỆN CẦN THIẾT:
 * -------------------
 * 1. File này phải được import TRƯỚC TẤT CẢ các thư viện khác trong main.ts
 * 2. Phải được khai báo trong angular.json tại phần "polyfills"
 * 3. Phải được load trước khi khởi tạo WebSocket connections
 * 
 * VÍ DỤ SỬ DỤNG TRONG DỰ ÁN:
 * --------------------------
 * main.component.ts:
 *   - initWebsocket() tạo SockJS connection
 *   - SockJS tìm kiếm global.location, global.navigator
 *   - Nhờ có fix này, global.location = window.location
 *   - WebSocket hoạt động bình thường
 * 
 * LƯU Ý BẢO MẬT:
 * ---------------
 * - Fix này chỉ tạo alias, không thay đổi hành vi bảo mật
 * - Không expose thêm API nào ra ngoài
 * - Chỉ giúp code Node.js chạy được trong browser
 */

// Polyfill: Gán thuộc tính global của window bằng chính window
// Điều này cho phép các thư viện Node.js tìm thấy global scope trong browser environment

