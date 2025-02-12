import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  // Cấu hình multer cho việc upload file
  getMulterOptions(destination: string) {
    return {
      storage: diskStorage({
        destination: destination,
        filename: (req, file, callback) => {
          const ext = path.extname(file.originalname); // Lấy phần mở rộng của file
          const filename = `${uuidv4()}${ext}`; // Đặt tên file bằng UUID để tránh trùng lặp
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn file tối đa 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Chỉ chấp nhận các file hình ảnh'), false);
        }
        callback(null, true);
      },
    };
  }
}
