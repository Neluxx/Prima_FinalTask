namespace Game {

  import ƒ = FudgeCore;

  export class Bat extends Enemy {
    private static readonly pivot: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));

    constructor() {
      super();
      this.health = 100;
      this.strength = 10;
      this.attackspeed = 1000; //in ms
      this.speedMax = new ƒ.Vector2(2, 5); //units per second

      setInterval(() => {
        this.moveLeft = !this.moveLeft;
      }, 2000);

      this.addComponent(new ƒ.ComponentTransform());
      this.show(ACTION.BAT_WALK);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
    }

    public act(_action: ACTION, _direction?: DIRECTION): void {
      switch (_action) {
          case ACTION.BAT_ATTACK:
            this.direct = (_direction == DIRECTION.RIGHT ? 1 : -1);
            this.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direct);
          this.speed.x = 0;
          break;
        case ACTION.BAT_DEATH:
          this.speed.x = 0;
          break;
        case ACTION.BAT_WALK:
          this.direct = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.speed.x = this.speedMax.x; // * direction;
          this.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direct);
          break;
      }
      if (_action == this.action)
        return;

      this.action = _action;
      this.show(_action);
    }

    private playerDetection(): void {
      if (Math.abs(player.cmpTransform.local.translation.x - this.cmpTransform.local.translation.x) < 3 && Math.abs(player.cmpTransform.local.translation.x - this.cmpTransform.local.translation.x) > 0.75) {
        if (player.cmpTransform.local.translation.x > this.cmpTransform.local.translation.x) {
          this.act(ACTION.BAT_WALK, DIRECTION.RIGHT);
        }
        else {
          this.act(ACTION.BAT_WALK, DIRECTION.LEFT);
        }
      }
      else if (Math.abs(player.cmpTransform.local.translation.x - this.cmpTransform.local.translation.x) < 3 && Math.abs(player.cmpTransform.local.translation.x - this.cmpTransform.local.translation.x) < 0.75) {
        if (player.cmpTransform.local.translation.x > this.cmpTransform.local.translation.x) {
          this.act(ACTION.BAT_ATTACK, DIRECTION.RIGHT);
        }
        else {
          this.act(ACTION.BAT_ATTACK, DIRECTION.LEFT);
        }
      }
      else {
        if (this.moveLeft) {
          this.act(ACTION.BAT_WALK, DIRECTION.LEFT);
        }
        else {
          this.act(ACTION.BAT_WALK, DIRECTION.RIGHT);
        }
      }
    }

    private update = (_event: ƒ.Eventƒ): void => {
      if (!this.isDead) {
        this.playerDetection();
        console.log("Bat: " + this.health);

        let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
        this.speed.y += Player.gravity.y * timeFrame;
        let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
        this.cmpTransform.local.translate(distance);

        this.checkCollision();
        this.checkPlayerCollision();

        if (this.health <= 0 && !this.isDead) {
          this.isDead = true;
          this.act(ACTION.BAT_DEATH);
        }
      }
    }

    private checkCollision(): void {
      for (let element of level.getChildren()) {
        let rect: ƒ.Rectangle = (<Element>element).getRectElement();
        let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
        if (hit) {
          let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
          translation.y = rect.y;
          this.cmpTransform.local.translation = translation;
          this.speed.y = 0;
        }
      }
    }

    private checkPlayerCollision(): void {
      let rect: ƒ.Rectangle = player.getRectPlayer();
      let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
      if (hit) {
          if (this.canTakeDamage && this.health > 0 && isAttacking) {
            this.health -= player.strength;
            this.canTakeDamage = false;
            setTimeout(() => {
              this.canTakeDamage = true;
            }, player.attackspeed);
          }
      }
    }

    public getRectEnemy(): ƒ.Rectangle {
      let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
      let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
      let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
      
      let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Bat.pivot);
      mtxResult = ƒ.Matrix4x4.MULTIPLICATION(mtxResult, ƒ.Matrix4x4.SCALING(new ƒ.Vector3(2, 2, 2)));
      topleft.transform(mtxResult, true);
      bottomright.transform(mtxResult, true);

      let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
      rect.position = topleft.toVector2();
      rect.size = size;

      return rect;
    }

    public getAttackSpeed(): number {
      return this.attackspeed;
    }

    public getStrength(): number {
      return this.strength;
    }

    public getIsDead(): boolean {
      return this.isDead;
    }
  }
}