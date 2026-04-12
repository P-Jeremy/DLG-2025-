export interface IMetaRepository {
  touch(): Promise<void>;
  getUpdatedAt(): Promise<Date>;
}
