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
    console.log('loading')
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


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Tạo previewUrl
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }
}
