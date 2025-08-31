import type { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import { deleteFileFromS3, moveFileInS3 } from "@/utils/s3Helper";

export class S3FileStorageAdapter implements FileStoragePort {
  moveTempTo(path: string, folder: string) {
    return moveFileInS3(path, folder);
  }

  uploadFileAndGetUrl(file: File, folder: string): Promise<string> {
    return this.uploadFileAndGetUrl(file, folder);
  }

  removeFile(file: string): Promise<void> {
    return deleteFileFromS3(file);
  }
}
