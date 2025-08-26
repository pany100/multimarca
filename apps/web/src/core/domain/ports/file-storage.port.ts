export interface FileStoragePort {
  moveTempTo(path: string, bucketFolder: string): Promise<string>;
}
