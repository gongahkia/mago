import { Component } from "../../ecs/Component";

export class PositionComponent extends Component {
  static typeName = "position";
  x: number;
  y: number;
  z: number; 

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z?: number): void {
    this.x = x;
    this.y = y;
    if (z !== undefined) this.z = z;
  }

  clone(): PositionComponent {
    return new PositionComponent(this.x, this.y, this.z);
  }
}