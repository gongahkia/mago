import { Component } from "../../ecs/Component";

export class HealthComponent extends Component {
  static typeName = "health";
  current: number;
  max: number;
  invulnerable: boolean = false;

  constructor(maxHealth: number, currentHealth?: number) {
    super();
    this.max = maxHealth;
    this.current = currentHealth ?? maxHealth;
  }

  takeDamage(amount: number): void {
    if (!this.invulnerable) {
      this.current = Math.max(0, this.current - amount);
    }
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
  }

  get isAlive(): boolean {
    return this.current > 0;
  }

  get percentage(): number {
    return (this.current / this.max) * 100;
  }
}
