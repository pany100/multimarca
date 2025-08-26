export interface UnitOfWork {
  run<T>(fn: (deps: { tx: any }) => Promise<T>): Promise<T>;
}
