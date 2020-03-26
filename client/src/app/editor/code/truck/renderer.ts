import { World, TileOpening, WorldState, Tile, Truck, TurnDirection, Direction } from '../../../shared/syntaxtree/truck/world';
import { BehaviorSubject } from 'rxjs';

export type RenderingDimensions = { width: number, height: number };

/**
 * Renderer.
 */
export class Renderer {
  /** True until the animation is stopped. */
  private running: boolean;

  /** The handle of the current pending rendering request. Might be undefined. */
  private currentAnimationRequest?: number;

  /** Renderer for the world to be drawn. */
  private worldRenderer: WorldRenderer;

  /** Rendering context. */
  private readonly ctx: RenderingContext;

  /** The dimension of the rendering context (parent object). Gets updated every frame. */
  private readonly dimensions: RenderingDimensions;

  /**
   * Initializes the renderer.
   * @param world World to be drawn.
   * @param canvasElement Canvas element.
   */
  constructor(world: World, private readonly canvasElement: HTMLCanvasElement) {
    // Setup the dimension calculation
    this.dimensions = {
      height: 0,
      width: 0
    };
    const nativeRenderingContext = this.canvasElement.getContext('2d', { alpha: false });

    this.running = true;

    this.ctx = new RenderingContext(nativeRenderingContext, this.dimensions, world);

    this.worldRenderer = new WorldRenderer(this.ctx.world, this);
  }

  /**
   * Stops the animation.
   */
  stop() {
    this.running = false;
    if (this.currentAnimationRequest != undefined) {
      cancelAnimationFrame(this.currentAnimationRequest);
    }
  }

  /**
   * Returns the current with of the parent that hosts the rendering canvas.
   */
  private get parentWidthPeek() {
    return (this.canvasElement.parentElement.offsetWidth);
  }

  /**
   * Draws until the animation is stopped.
   * @param timestamp Timestamp.
   */
  render(timestamp: DOMHighResTimeStamp = null) {
    this.currentAnimationRequest = undefined;
    if (!this.running) { return; }

    // Set timestamp
    this.ctx.timestamp(timestamp);

    // The dimensions are updated every frame in order to resize the canvas even
    // if another neighbor element has changed his size.
    // Adding a window size listener is insufficient and other mechanisms
    // to detect size-changes are not supported everywhere.

    // The canvas will always have size of it's parent's width as a square.
    const currentDimension = this.parentWidthPeek;
    this.dimensions.width = currentDimension;
    this.dimensions.height = currentDimension;

    // Since resizing the canvas is expensive and will reset a
    // lot of internal variables inside the native context,
    // we only want to resize if it's necessary.
    if (this.canvasElement.width != this.dimensions.width ||
        this.canvasElement.height != this.dimensions.height) {
      this.canvasElement.width = this.dimensions.width;
      this.canvasElement.height = this.dimensions.height;
    }

    // Clear canvas
    this.ctx.ctx.fillStyle = '#FFFFFF';
    this.ctx.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);

    // Draw world
    this.worldRenderer.draw(this.ctx);

    // Requeue next request
    this.currentAnimationRequest = requestAnimationFrame((ts: DOMHighResTimeStamp) => this.render(ts));
  }
}

/**
 * Rendering context.
 */
class RenderingContext {
  /** Timestamp of the start of the animation. */
  start: DOMHighResTimeStamp;

  /** Timestamp of the previous frame. */
  previousFrame: DOMHighResTimeStamp;

  /** Timestamp of the current frame. */
  currentFrame: DOMHighResTimeStamp;

  /**
   * Initializes the rendering context.
   * @param ctx Canvas 2d context.
   * @param dimensions The dimensions of the rendering context.
   * @param world World.
   */
  constructor(
    public readonly ctx: CanvasRenderingContext2D,
    private readonly dimensions: RenderingDimensions,
    public readonly world: World) {
    this.ctx = ctx;
    this.world = world;

    this.start = 0;
    this.previousFrame = 0;
    this.currentFrame = 0;
  }

  /**
   * Current target width to render.
   */
  get width() {
    return this.dimensions.width;
  }

  /**
   * Current target width to render.
   */
  get height() {
    return this.dimensions.height;
  }

  /**
   * Duration of a step in milliseconds.
   * @return Duration in milliseconds.
   */
  get animationSpeed(): number {
    return this.world.animationSpeed;
  }

  /**
   * Rotates the canvas by the passed number of degrees around the passed point,
   * executes the function and resets the context.
   * @param x Point to be rotated.
   * @param y Point to be rotated.
   * @param angle Degree to be rotated.
   * @param f Function.
   */
  rotate(x: number, y: number, angle: number, f: () => void) {
    // Cache context
    this.ctx.save();

    // Move origin
    this.ctx.translate(x, y);

    // Turn
    this.ctx.rotate(angle * Math.PI / 180);

    // Draw
    f();

    // Reset context
    this.ctx.restore();
  }

  /**
   * Sets the canvas's alpha value to the passed value, executes the function,
   * and resets the alpha value.
   * @param alpha alpha value.
   * @param f Function.
   */
  alpha(alpha: number, f: () => void) {
    const tempAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = alpha;
    f();
    this.ctx.globalAlpha = tempAlpha;
  }

  /**
   * Updates the timestamp.
   * @param ts timestamp.
   */
  timestamp(ts: DOMHighResTimeStamp = null) {
    if (ts == null) {
      ts = performance.now();
      this.start = ts;
      this.previousFrame = ts;
      this.currentFrame = ts;
    } else {
      this.previousFrame = this.currentFrame;
      this.currentFrame = ts;
    }
  }

  /**
   * Returns the time since the start of the animation.
   * @return Time since the start of the animation.
   */
  get timeSinceStart(): DOMHighResTimeStamp {
    return this.currentFrame - this.start;
  }
}

/**
 * Interface for an ObjectRenderer.
 */
interface ObjectRenderer {
  /**
   * Draws the object in the given context.
   * @param ctx RenderingContext.
   */
  draw(ctx: RenderingContext): void;
}

/**
 * ObjectRenderer für eine Welt.
 */
class WorldRenderer implements ObjectRenderer {
  /** World to be drawn. */
  world: World;

  /** Parent Renderer. */
  parent: Renderer;

  /** WorldStateRenderer. */
  stateRenderer: WorldStateRenderer;

  /**
   * Initializes the WorldRenderer.
   * @param world World to be drawn.
   * @param parent Parent Renderer.
   */
  constructor(world: World, parent: Renderer) {
    this.world = world;
    this.parent = parent;

    this.stateRenderer = new WorldStateRenderer(this.world.state, this);
  }

  /**
   * Draws the world in the given context.
   * @param ctx RenderingContext.
   */
  draw(ctx: RenderingContext) {
    // Update WorldStateRenderer when state changed
    if (this.stateRenderer.state.step > this.world.state.step) {
      // Don't animate undo
      this.stateRenderer.update(this.world.state, true);
    } else {
      while (this.stateRenderer.state.step < this.world.state.step) {
        this.stateRenderer.update(this.world.getState(this.stateRenderer.state.step + 1));
      }
    }
    this.stateRenderer.draw(ctx);
  }
}

/**
 * ObjectRenderer for a world state.
 */
class WorldStateRenderer implements ObjectRenderer {
  /** World state to be drawn. */
  state: WorldState;

  /** Parent WorldRenderer. */
  parent: WorldRenderer;

  /** TruckRender. */
  truckRenderer: TruckRenderer;

  /** Initialized TileRenderer for the state. */
  tileRenderers: Array<TileRenderer>;

  /**
   * Initializes the WorldStateRenderer.
   * @param state World state to be drawn.
   * @param parent Parent WorldRenderer.
   */
  constructor(state: WorldState, parent: WorldRenderer) {
    this.state = state;
    this.parent = parent;

    // Preload TileRenderer
    this.tileRenderers = this.state.tiles.map((t) => new TileRenderer(t, this));

    // Preload TruckRenderer
    this.truckRenderer = new TruckRenderer(this.state.truck, this);
  }

  /**
   * Draws the world state in the passed context.
   * @param ctx RenderingContext.
   */
  draw(ctx: RenderingContext) {
    this.tileRenderers.forEach((t) => t.draw(ctx));
    this.truckRenderer.draw(ctx);
  }

  /**
   * Update state.
   * @param state New state.
   * @param undo True if this is a step back.
   */
  update(state: WorldState, undo: boolean = false) {
    this.state = state;

    this.tileRenderers.forEach((t, k) => t.update(state.tiles[k], undo));
    this.truckRenderer.update(state.truck, undo);
  }
}

/**
 * ObjectRenderer for a tile.
 */
class TileRenderer implements ObjectRenderer {
  /** Tile to be drawn. */
  tile: Tile;

  /** Parent WorldStateRenderer. */
  parent: WorldStateRenderer;

  /** Tile of the previous state. */
  prevTile: Tile;

  /** Sprite for the tile background. */
  tileSprite: Sprite;

  /** Sprite for the traffic lights. */
  trafficLightSprite: Sprite;

  /** Sprite for freight. */
  freightSprite: Sprite;

  /** Start timestamp of the animation. */
  startAnimation: DOMHighResTimeStamp;

  /** Overlap of the tile to avoid ugly edges. */
  overlap = -1;

  /**
   * Initializes the TileRenderer.
   * @param tile Tile to be drawn.
   * @param parent Parent WorldStateRenderer.
   */
  constructor(tile: Tile, parent: WorldStateRenderer) {
    this.tile = tile;
    this.parent = parent;
    this.prevTile = null;

    // Preload Sprites
    this.tileSprite = SpriteFactory.getSprite('/vendor/truck/tiles.svg', 64, 64);
    this.trafficLightSprite = SpriteFactory.getSprite('/vendor/truck/trafficLight.svg', 10, 10);
    this.freightSprite = SpriteFactory.getSprite('/vendor/truck/freight.svg', 10, 10);
  }

  /**
   * Draws the tile in the given context.
   * @param ctx RenderingContext.
   */
  draw(ctx: RenderingContext) {
    // Calculate the height and width of the tile
    const tileWidth = ctx.width / this.tile.position.width;
    const tileHeight = ctx.height / this.tile.position.height;

    if (this.startAnimation === null) { this.startAnimation = ctx.currentFrame; }
    const t = (ctx.currentFrame - this.startAnimation) / (this.parent.state.time * ctx.animationSpeed);

    // Calculate the freight alpha value
    const freightAlpha = t < 1 && this.prevTile && this.prevTile.freightItems !== this.tile.freightItems
      ? t
      : 1;

    this.tileSprite.draw(
      ctx, this.tileSpriteNumber,
      tileWidth * this.tile.position.x - this.overlap,
      tileWidth * this.tile.position.y - this.overlap,
      tileWidth + this.overlap * 2,
      tileHeight + this.overlap * 2
    );

    // Draw traffic lights
    this.tile.trafficLights.forEach((tl, i) => {
      if (tl != null) {
        // Switch traffic light on half of the step
        const isGreen = tl.isGreen(Math.max(0, t < 0.5 ? this.parent.state.timeStep - 1 : this.parent.state.timeStep));
        this.trafficLightSprite.draw(
          ctx, i * 2 + (isGreen ? 1 : 0),
          tileWidth * this.tile.position.x - this.overlap,
          tileWidth * this.tile.position.y - this.overlap,
          tileWidth + this.overlap * 2,
          tileHeight + this.overlap * 2
        );
      }
    });

    // Draw old freight
    if (this.prevTile && this.prevTile.freightItems > 0 && freightAlpha < 1) {
      ctx.alpha(
        1 - freightAlpha,
        () => {
          this.freightSprite.draw(
            ctx, this.freightSpriteNumber(this.prevTile),
            tileWidth * this.tile.position.x - this.overlap,
            tileWidth * this.tile.position.y - this.overlap,
            tileWidth + this.overlap * 2,
            tileHeight + this.overlap * 2
          );
        }
      );
    }

    // Draw new freight
    if (this.tile.freightItems > 0) {
      ctx.alpha(
        freightAlpha,
        () => {
          this.freightSprite.draw(
            ctx, this.freightSpriteNumber(this.tile),
            tileWidth * this.tile.position.x - this.overlap,
            tileWidth * this.tile.position.y - this.overlap,
            tileWidth + this.overlap * 2,
            tileHeight + this.overlap * 2
          );
        }
      );
    }

    // Draw targets
    if (this.tile.freightTarget != null) {
      this.freightSprite.draw(
        ctx, this.freightTargetSpriteNumber,
        tileWidth * this.tile.position.x - this.overlap,
        tileWidth * this.tile.position.y - this.overlap,
        tileWidth + this.overlap * 2,
        tileHeight + this.overlap * 2
      );
    }

    // Possibly draw a "truck is here"-marker
    if (this.tile.position.x === this.parent.state.truck.position.x
      && this.tile.position.y === this.parent.state.truck.position.y) {
      // ctx.ctx.strokeStyle = `hsl(${this.parent.state.time}, 100, 50)`;
      ctx.ctx.strokeStyle = "blue";
      ctx.ctx.strokeRect(
        tileWidth * this.tile.position.x - this.overlap,
        tileWidth * this.tile.position.y - this.overlap,
        tileWidth + this.overlap * 2,
        tileHeight + this.overlap * 2
      );
    }
  }

  /**
   * Update tile.
   * @param tile New tile.
   * @param undo True if this is a step back.
   */
  update(tile: Tile, undo: boolean = false) {
    this.prevTile = undo ? null : this.tile;
    this.tile = tile;
    this.startAnimation = null;
  }

  /**
   * Returns the number of the tile in the sprite, depending on the requested
   * openings.
   * @return Number of the tile in the sprite.
   */
  private get tileSpriteNumber(): number {
    return {
      [TileOpening.None]: 0,
      [TileOpening.North]: 1,
      [TileOpening.East]: 2,
      [TileOpening.South]: 3,
      [TileOpening.West]: 4,

      [TileOpening.North | TileOpening.South]: 5,
      [TileOpening.East | TileOpening.West]: 6,

      [TileOpening.North | TileOpening.East]: 7,
      [TileOpening.East | TileOpening.South]: 8,
      [TileOpening.South | TileOpening.West]: 9,
      [TileOpening.North | TileOpening.West]: 10,

      [TileOpening.North | TileOpening.East | TileOpening.South]: 11,
      [TileOpening.East | TileOpening.South | TileOpening.West]: 12,
      [TileOpening.North | TileOpening.South | TileOpening.West]: 13,
      [TileOpening.North | TileOpening.East | TileOpening.West]: 14,

      [TileOpening.North | TileOpening.East | TileOpening.South | TileOpening.West]: 15,
    }[this.tile.openings];
  }

  /**
   * Returns the number of the tile in the sprite, depending on the requested
   * freight.
   * @param tile Tile to get the sprite number for.
   * @return Number of the tile in the sprite.
   */
  private freightSpriteNumber(tile: Tile): number {
    return {
      'red': 0,
      'green': 2,
      'blue': 4,
    }[tile.freightColor()];
  }

  /**
   * Returns the number of the tile in the sprite depending on the requested
   * target.
   * @return Number of the tile in the sprite.
   */
  private get freightTargetSpriteNumber(): number {
    return {
      'red': 1,
      'green': 3,
      'blue': 5,
    }[this.tile.freightColor()];
  }
}

/**
 * ObjectRenderer of a truck.
 */
class TruckRenderer implements ObjectRenderer {
  /** Duration of a turning signal interval in milliseconds. */
  readonly blinkerInterval = 700;

  /** Truck to be drawn. */
  truck: Truck;

  /** Parent WorldStateRenderer. */
  parent: WorldStateRenderer;

  /** Truck of the previous state. */
  prevTruck: Truck;

  /** Start timestamp of the animation. */
  startAnimation: DOMHighResTimeStamp;

  /** Sprite for the truck. */
  truckSprite: Sprite;

  /** Sprite for the blinker. */
  turnSignalSprite: Sprite;

  /**
   * Initializes the TruckRenderer.
   * @param truck Truck to be drawn.
   * @param parent Parent WorldStateRenderer.
   */
  constructor(truck: Truck, parent: WorldStateRenderer) {
    this.truck = truck;
    this.parent = parent;

    this.prevTruck = null;
    this.startAnimation = null;

    // Sprites vorladen
    this.truckSprite = SpriteFactory.getSprite('/vendor/truck/truck.svg', 10, 10);
    this.turnSignalSprite = SpriteFactory.getSprite('/vendor/truck/turnSignal.svg', 10, 10);
  }

  /**
   * Calculates the center of the truck.
   * @param tileWidth Width of a tile.
   * @param tileHeight Height of a tile.
   * @param truck Truck.
   */
  private calculateTruckPosition(tileWidth: number, tileHeight: number, truck: Truck) {
    let truckPositionX = tileWidth * truck.position.x + tileWidth / 2;
    let truckPositionY = tileHeight * truck.position.y + tileHeight / 2;

    if (truck.facingDirection === Direction.North) { truckPositionY += tileHeight / 2; }
    if (truck.facingDirection === Direction.East) { truckPositionX -= tileWidth / 2; }
    if (truck.facingDirection === Direction.South) { truckPositionY -= tileHeight / 2; }
    if (truck.facingDirection === Direction.West) { truckPositionX += tileWidth / 2; }

    return {
      x: truckPositionX,
      y: truckPositionY
    };
  }

  /**
   * Calculates the rotation angle of a truck.
   * @param truck Truck.
   */
  private calculateTruckAngle(truck: Truck) {
    return (truck.facing) * 90;
  }

  /**
   * Draws the truck in the given context.
   * @param ctx RenderingContext.
   */
  draw(ctx: RenderingContext) {
    // Calculate the height and width of the tile
    const tileWidth = ctx.width / this.truck.position.width;
    const tileHeight = ctx.height / this.truck.position.height;

    // Calculate the height and width of the truck
    const truckWidth = tileWidth / 3;
    const truckHeight = tileHeight / 3;

    // Calculate the position of the truck
    let truckPosition = this.calculateTruckPosition(tileWidth, tileHeight, this.truck);
    let truckAngle = this.calculateTruckAngle(this.truck);
    let turnSignalSpriteNumber = this.turnSignalSpriteNumber(this.truck);

    // Current Truck is fully visible by default
    let truckAlpha = 1;

    if (this.prevTruck) {
      if (this.startAnimation === null) { this.startAnimation = ctx.currentFrame; }

      const t = (ctx.currentFrame - this.startAnimation) / (this.parent.state.time * ctx.animationSpeed);

      // Interpolate if animation is not finished yet and truck has changed its
      // position between states
      if (t <= 1 && (this.truck.position !== this.prevTruck.position || this.truck.facing !== this.prevTruck.facing)) {
        // Calculate position of previous truck
        const prevTruckPosition = this.calculateTruckPosition(tileWidth, tileHeight, this.prevTruck);
        const prevTruckAngle = this.calculateTruckAngle(this.prevTruck);

        if (this.truck.facing !== this.prevTruck.facing) {
          const p0 = prevTruckPosition;
          const p1 = {
            x: tileWidth * this.prevTruck.position.x + tileWidth / 2,
            y: tileHeight * this.prevTruck.position.y + tileHeight / 2
          };
          const p2 = truckPosition;
          // De Casteljau
          truckPosition = {
            x: (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x,
            y: (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y
          };
        } else {
          // Interpolate position
          truckPosition.x = prevTruckPosition.x + (truckPosition.x - prevTruckPosition.x) * t;
          truckPosition.y = prevTruckPosition.y + (truckPosition.y - prevTruckPosition.y) * t;
        }

        // Interpolate angle
        truckAngle = prevTruckAngle + (truckAngle - prevTruckAngle) * t;

        // If necessary, leave the turn signal on as long as truck is turning
        if (this.prevTruck.turning !== TurnDirection.Straight) {
          turnSignalSpriteNumber = this.turnSignalSpriteNumber(this.prevTruck);
        }
      }

      if (t <= 1 && this.truck.freightColor() !== this.prevTruck.freightColor()) {
        truckAlpha = t;
      }
    }

    // Calculate the alpha value for the turn signal
    const turnSignalAlpha = ((t: DOMHighResTimeStamp) => {
      const tn = (t % this.blinkerInterval) / this.blinkerInterval;
      // min(1, max(0, cos(x * 2 * pi)+0.5)) with x from 0 to 1
      return Math.min(1, Math.max(0, Math.cos(tn * 2 * Math.PI) + 0.5));
    })(ctx.timeSinceStart);

    ctx.rotate(
      truckPosition.x, truckPosition.y,
      truckAngle,
      () => {
        // Turn signal
        ctx.alpha(
          turnSignalAlpha,
          () => {
            this.turnSignalSprite.draw(
              ctx, turnSignalSpriteNumber,
              -(truckWidth / 2),
              -(truckHeight / 2),
              truckWidth, truckHeight
            );
          }
        );

        // Old truck
        if (truckAlpha < 1) {
          ctx.alpha(
            1 - truckAlpha,
            () => {
              this.truckSprite.draw(
                ctx, this.truckSpriteNumber(this.prevTruck),
                -(truckWidth / 2),
                -(truckHeight / 2),
                truckWidth, truckHeight
              );
            }
          );
        }

        // New truck
        ctx.alpha(
          truckAlpha,
          () => {
            this.truckSprite.draw(
              ctx, this.truckSpriteNumber(this.truck),
              -(truckWidth / 2),
              -(truckHeight / 2),
              truckWidth, truckHeight
            );
          }
        );
      }
    );
  }

  /**
   * Update the truck.
   * @param truck New truck.
   * @param undo True if this is a step back.
   */
  update(truck: Truck, undo: boolean = false) {
    this.prevTruck = undo ? null : this.truck;
    this.truck = truck;
    this.startAnimation = null;
  }

  /**
   * Returns the number of the tile in the sprite, depending on the freight.
   * @param truck Truck to get the sprite number for.
   * @return Number of the tile in the sprite.
   */
  private truckSpriteNumber(truck: Truck): number {
    if (truck.freightColor() == null) { return 0; }
    return {
      red: 1,
      green: 2,
      blue: 3,
    }[truck.freightColor()];
  }

  /**
   * Returns the number of the tile in the sprite, depending on the turn signal.
   * @param truck Truck for which the turn signal is to be determined.
   * @return Number of the tile in the sprite.
   */
  private turnSignalSpriteNumber(truck: Truck): number {
    return {
      [TurnDirection.Straight]: 0,
      [TurnDirection.Left]: 1,
      [TurnDirection.Right]: 2,
    }[truck.turning];
  }
}

/**
 * Generates sprites and reuses them using the file path when requested again.
 */
class SpriteFactory {
  /** Previously loaded sprites. */
  static sprites: Array<Sprite> = [];

  /**
   * Returns an instance of the sprite for the path.
   * @param path Path to the image file.
   * @param width Width of a single tile in the sprite.
   * @param height Height of a single tile in the sprite.
   */
  static getSprite(path: string, width: number, height: number) {
    const sprites = SpriteFactory.sprites.filter((s) => s.path === path);
    if (sprites.length === 1) {
      return sprites[0];
    }
    const sprite = new Sprite(path, width, height);
    SpriteFactory.sprites.push(sprite);
    return sprite;
  }
}

/**
 * Sprite.
 */
class Sprite {
  /** Path to the image file for identification by the SpriteFactory. */
  path: string;

  /** Image element for drawing on a canvas. */
  private image: HTMLImageElement = new Image();

  /** Width of a single tile in the sprite. */
  private width: number;

  /** Height of a single tile in the sprite. */
  private height: number;

  /**
   * Initializes and preloads a sprite.
   * @param path Image element for drawing on a canvas.
   * @param width Width of a single tile in the sprite.
   * @param height Height of a single tile in the sprite.
   */
  constructor(path: string, width: number, height: number) {
    this.path = path;
    this.image.src = path;
    this.width = width;
    this.height = height;
  }

  /**
   * Draws a tile from the sprite of the specified size into a RenderingContext.
   * @param ctx RenderingContext.
   * @param number Number of the tile in the sprite to be drawn.
   * @param x X position in the canvas to draw on.
   * @param y Y position in the canvas to draw on.
   * @param width Width in which to draw.
   * @param height Height in which to draw.
   */
  draw(ctx: RenderingContext, number: number, x: number, y: number, width: number, height: number) {
    ctx.ctx.drawImage(
      this.image,
      this.width * number,
      0,
      this.width,
      this.height,
      x,
      y,
      width,
      height
    );
  }
}
