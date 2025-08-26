import type { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import { moveFileInS3 } from "@/utils/s3Helper";

export class S3FileStorageAdapter implements FileStoragePort {
  moveTempTo(path: string, folder: string) {
    return moveFileInS3(path, folder);
  }
}
