import {Component, EventEmitter, input, Input, InputSignal, model, output, Output} from '@angular/core';
import {ChatResponse} from '../../service/models/chat-response';
import {UserResponse} from '../../service/models/user-response';
import {UserService} from '../../service/services/user.service';

@Component({
  selector: 'app-avatar-modal-component',
  imports: [],
  templateUrl: './avatar-modal-component.component.html',
  standalone: true,
  styleUrl: './avatar-modal-component.component.scss'
})
export class AvatarModalComponentComponent {
  avatarUpdated = output<string>();
  currentUser = model<UserResponse>({});
  close = output<void>();

  loading = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService
    // private dialogRef: MatDialogRef<AvatarModalComponentComponent> // Để đóng modal
  ) {
  }

  closeModal() {
    this.close.emit();
  }

  uploadAvatar() {
    if (!this.selectedFile) {
      console.log('Vui lòng chọn ảnh trước khi tải lên')
      this.errorMessage = 'Vui lòng chọn ảnh trước khi tải lên';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.userService.uploadAvatar(this.selectedFile)
      .subscribe({
        next: (res) => {
          console.log('updated successfully')
          this.currentUser.set(res);   //currentUser là ModelSignal (tạo bằng model()) nên cần dùng method set() để cập nhật lại cho component cha nữa
          this.loading = false;
        },
        error: (error) => {
          this.handleUploadError(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  private handleUploadError(error: any) {
    if (error.status === 400) {
      this.errorMessage = error.error || 'File không hợp lệ';
    } else if (error.status === 413) {
      this.errorMessage = 'Kích thước ảnh quá lớn';
    } else if (error.status === 415) {
      this.errorMessage = 'Chỉ chấp nhận file ảnh';
    } else {
      this.errorMessage = 'Lỗi tải ảnh lên, vui lòng thử lại';
    }
  }


  /**
   * Xử lý sự kiện khi người dùng chọn file ảnh đại diện mới
   * @param event - Sự kiện input change được kích hoạt khi người dùng chọn file
   */
  onFileSelected(event: Event) {
    // Ép kiểu event.target thành HTMLInputElement để truy cập thuộc tính files
    const input = event.target as HTMLInputElement;

    // Kiểm tra xem người dùng đã chọn file nào chưa
    if (input.files && input.files.length > 0) {
      // Lấy file đầu tiên được chọn và lưu vào biến selectedFile vì ảnh đại diện thì chỉ được chọn duy nhất 1 cái
      this.selectedFile = input.files[0];

      // Tạo URL xem trước (preview) của ảnh
      const reader = new FileReader(); // Tạo một đối tượng FileReader để đọc file

      // Định nghĩa hàm callback sẽ được gọi khi FileReader hoàn thành việc đọc file
      reader.onload = (e: ProgressEvent<FileReader>) => {
        // e.target?.result chứa nội dung file dưới dạng Data URL
        // Gán Data URL (chuỗi base64) vào previewUrl để hiển thị ảnh xem trước
        this.previewUrl = e.target?.result as string;
      };

      // Bắt đầu đọc file dưới dạng Data URL (chuỗi base64)
      // Data URL có định dạng: data:image/jpeg;base64,/9j/4AAQSkZJRgAB...
      // Chuỗi Base64 được tự động giải mã bởi trình duyệt khi bạn gán nó cho thuộc tính src của thẻ <img>
      
      reader.readAsDataURL(this.selectedFile); 
//     Phương thức readAsDataURL() của đối tượng FileReader thực hiện việc đọc nội dung của file (trong trường hợp này là this.selectedFile) và chuyển đổi nó thành chuỗi dữ liệu dạng Data URL.
//     Khi quá trình đọc hoàn tất, sự kiện onload được kích hoạt
//     Callback function mà bạn đã định nghĩa trước đó (reader.onload = ...) sẽ được thực thi
//     reader.onload là một property mà bạn gán một hàm callback vào. Hàm này sẽ được tự động gọi bởi JavaScript runtime khi quá trình đọc file hoàn tất, cho phép code của bạn phản ứng với sự kiện đó để xử lý kết quả (trong trường hợp này là hiển thị ảnh preview).
    
  } else {
      // Trường hợp không có file nào được chọn hoặc người dùng hủy chọn file
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }
}
