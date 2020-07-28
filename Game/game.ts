
namespace Game {
  export import ƒ = FudgeCore;
  export import ƒAid = FudgeAid;

  export let data: ExternalData;
  export let game: ƒ.Node;
  export let level: ƒ.Node;
  export let player: Player;
  export let enemies: ƒ.Node;
  export let camera: ƒ.Node;
  export let gameOver: boolean = false;
  export let isAttacking: boolean = false;
  export let viewport: ƒ.Viewport;
  export let bg: ƒ.Node;

  //music and sounds
  export let audioDungeon: ƒ.Audio;
  export let audioItem: ƒ.Audio;
  export let audioDeathMountain: ƒ.Audio;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");

    //load data
    data = await loadJSON();
    
    //find spritesheet and generate Sprites
    let img: HTMLImageElement = document.querySelector("#spritesheet");
    let spritesheet: ƒ.CoatTextured = ƒAid.createSpriteSheet("Spritesheet", img);
    SpriteGenerator.generateAnimations(spritesheet);
    
    img = document.querySelector("#tileset");
    spritesheet = ƒAid.createSpriteSheet("Tileset", img);
    SpriteGenerator.generateTileset(spritesheet);
    
    //create Game
    game = new ƒ.Node("Game");
    player = new Player();
    level = Level.createLevel();
    enemies = Level.createEnemies();
    bg = Level.createBackground();
    game.appendChild(level);
    game.appendChild(player);
    game.appendChild(enemies);
    game.appendChild(bg);

    //create music
    await loadMusic();
    playMusic(audioDungeon);
    
    //create Camera
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(10);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    cmpCamera.backgroundColor = ƒ.Color.CSS("white");

    camera = new ƒ.Node("Camera");
    camera.addComponent(new ƒ.ComponentTransform());
    camera.addComponent(cmpCamera);
    game.appendChild(camera);

    //create Viewport
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", game, camera.getComponent(ƒ.ComponentCamera), canvas);
    viewport.draw();

    //add EventListener
    viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, handleKeyboard);
    viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
    viewport.setFocus(true);

    //start Loop
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
  }

  function update(): void {
    //check if game over
    if (gameOver) {
      player.act(ACTION.PLAYER_DIE);
    }

    //check if any Key is active
    if (!ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.SPACE]) && !gameOver) {
      player.act(ACTION.PLAYER_IDLE);
      isAttacking = false;
    }

    //camera movement
    camera.cmpTransform.local.translation = player.cmpTransform.local.translation;
    camera.cmpTransform.local.translateY(1.5);
    bg.cmpTransform.local.translation = player.cmpTransform.local.translation;
    bg.cmpTransform.local.translateY(0.25);

    viewport.draw();
  }

  function handleKeyboard(_event: ƒ.EventKeyboard): void {
    if (!gameOver) {
      switch(_event.code) {
        case (ƒ.KEYBOARD_CODE.W):
        case (ƒ.KEYBOARD_CODE.ARROW_UP):
          player.act(ACTION.PLAYER_JUMP);
          isAttacking = false;
          break;
        case (ƒ.KEYBOARD_CODE.A):
        case (ƒ.KEYBOARD_CODE.ARROW_LEFT):
          player.act(ACTION.PLAYER_WALK, DIRECTION.LEFT);
          isAttacking = false;
          break;
        case (ƒ.KEYBOARD_CODE.D):
        case (ƒ.KEYBOARD_CODE.ARROW_RIGHT):
          player.act(ACTION.PLAYER_WALK, DIRECTION.RIGHT);
          isAttacking = false;
          break;
        case (ƒ.KEYBOARD_CODE.S):
        case (ƒ.KEYBOARD_CODE.ARROW_DOWN):
          //shield
          //player.act(ACTION.PLAYER_SHIELD);
          //isAttacking = false;
          break;
        case (ƒ.KEYBOARD_CODE.SPACE):
          player.act(ACTION.PLAYER_ATTACK);
          isAttacking = true;
          break;
      }
    }
  }

  async function loadMusic(): Promise<void> {
    //load music
    audioDungeon = await ƒ.Audio.load("../Assets/Sounds/Music/Dungeon.mp3");
    audioDeathMountain = await ƒ.Audio.load("../Assets/Sounds/Music/DeathMountain.mp3");
    audioItem = await ƒ.Audio.load("../Assets/Sounds/Music/Item.mp3");
  }

  export function playMusic(music: ƒ.Audio) {
    let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(music, true, true);
    player.addComponent(cmpAudio);
    ƒ.AudioManager.default.listenTo(player);
  }

  export function playSound(sound: ƒ.Audio) {
    let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(sound, false, true);
    player.addComponent(cmpAudio);
  }
}