import { Entity } from "../ecs/Entity";
import { PositionComponent } from "./components/PositionComponent";
import { HealthComponent } from "./components/HealthComponent";

export class Player extends Entity {
  constructor(x: number, y: number) {
    super();
    this.addComponent(new PositionComponent(x, y));
    this.addComponent(new HealthComponent(100));
  }
}

export default Player;