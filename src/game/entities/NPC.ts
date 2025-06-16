import { Entity } from "../ecs/Entity";
import { PositionComponent } from "./components/PositionComponent";
import { HealthComponent } from "./components/HealthComponent";
import { AIBehaviorComponent } from "./components/AIBehaviorComponent";

export class NPC extends Entity {
  constructor(x: number, y: number, aiType: string) {
    super();
    this.addComponent(new PositionComponent(x, y));
    this.addComponent(new HealthComponent(50));
    this.addComponent(new AIBehaviorComponent(aiType));
  }
}

export default NPC;