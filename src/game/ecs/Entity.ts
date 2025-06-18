import Component from "./Component";

export class Entity {
  static nextId = 1;
  readonly id: number;
  private components: Map<string, Component> = new Map();

  constructor() {
    this.id = Entity.nextId++;
  }

  addComponent(component: Component): this {
    const typeName = (component.constructor as typeof Component).getTypeName();
    component.entityId = this.id;
    this.components.set(typeName, component);
    if (component.onAttach) component.onAttach(this.id);
    return this;
  }

  removeComponent(typeName: string): void {
    const component = this.components.get(typeName);
    if (component) {
      if (component.onDetach) component.onDetach();
      component.entityId = null;
      this.components.delete(typeName);
    }
  }

  getComponent<T extends Component>(typeName: string): T | undefined {
    return this.components.get(typeName) as T | undefined;
  }

  hasComponent(typeName: string): boolean {
    return this.components.has(typeName);
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }
}

export default Entity;