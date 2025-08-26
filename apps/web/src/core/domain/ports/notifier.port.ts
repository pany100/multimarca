export interface NotifierPort {
  emit(event: string, payload?: any): void;
}
