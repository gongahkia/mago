export abstract class Component {
  static typeName: string;
  entityId: number | null = null;
  constructor() {}
  static getTypeName(): string {
    return this.typeName;
  }
  onAttach?(entityId: number): void;
  onDetach?(): void;
}

export default Component;