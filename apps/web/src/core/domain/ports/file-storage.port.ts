export interface FileStoragePort {
  moveTempTo(path: string, bucketFolder: string): Promise<string>;
  uploadFileAndGetUrl(file: File, folder: string): Promise<string>;
  removeFile(file: string): Promise<void>;
}
