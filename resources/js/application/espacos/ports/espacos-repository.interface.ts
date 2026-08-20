export interface IEspacosRepository {
    favoritar(id: number): Promise<void>;
    desfavoritar(id: number): Promise<void>;
}
