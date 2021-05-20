import {
  Direction,
  DirectionUtil,
  Position,
  Size,
  Tile,
  TileOpening,
  Truck,
  TurnDirection,
  World,
  WorldPreviewInfo,
  WorldState,
} from "../../../shared/syntaxtree/truck/world";
import { nameof } from "../../../shared/util";

export type RenderingDimensions = { width: number; height: number };

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

  /** The canvas element */
  private readonly canvasElement: HTMLCanvasElement;

  /** The native 2d context of the canvas element */
  private readonly nativeRenderingContext: CanvasRenderingContext2D;

  /** The dimension of the rendering context (parent object). Gets updated every frame. */
  private readonly canvasDimensions: RenderingDimensions;

  /** Timestamp of the last render start */
  private lastTimestamp: DOMHighResTimeStamp;

  /**
   * Initializes the renderer.
   * @param world World to be drawn.
   * @param canvasElement Canvas element.
   */
  constructor(world: World, canvasElement: HTMLCanvasElement) {
    // Setup the dimension calculation
    this.canvasDimensions = {
      height: 0,
      width: 0,
    };
    this.canvasElement = canvasElement;
    this.nativeRenderingContext = this.canvasElement.getContext("2d", {
      alpha: false,
    });

    this.running = true;

    this.worldRenderer = new WorldRenderer(world);
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
    return this.canvasElement.parentElement.clientWidth;
  }

  /**
   * Draws until the animation is stopped.
   * @param timestamp Timestamp.
   */
  render(timestamp: DOMHighResTimeStamp = null) {
    this.currentAnimationRequest = undefined;
    if (!this.running) {
      return;
    }

    // The canvasDimensions are updated every frame in order to resize the canvas even
    // if another neighbor element has changed his size.
    // Adding a window size listener is insufficient and other mechanisms
    // to detect size-changes are not supported everywhere.

    // The canvas will always have size of it's parent's width as a square.
    const currentDimension = this.parentWidthPeek;
    this.canvasDimensions.width = currentDimension;
    this.canvasDimensions.height = currentDimension;

    // Since resizing the canvas is expensive and will reset a
    // lot of internal variables inside the native context,
    // we only want to resize if it's necessary.
    if (
      this.canvasElement.width != this.canvasDimensions.width ||
      this.canvasElement.height != this.canvasDimensions.height
    ) {
      this.canvasElement.width = this.canvasDimensions.width;
      this.canvasElement.height = this.canvasDimensions.height;
    }

    const ctx = new RenderingContext(
      this.nativeRenderingContext,
      this.canvasDimensions,
      timestamp
    );

    this.lastTimestamp = timestamp;

    // Clear canvas
    ctx.ctx.fillStyle = "#FFFFFF";
    ctx.ctx.fillRect(0, 0, ctx.canvasWidth, ctx.canvasHeight);

    // Draw world
    this.worldRenderer.draw(ctx);

    // Requeue next request
    this.currentAnimationRequest = requestAnimationFrame(
      (ts: DOMHighResTimeStamp) => this.render(ts)
    );
  }
}

/**
 * Rendering context.
 */
class RenderingContext {
  /** Timestamp of the current frame. */
  public readonly currentTime: DOMHighResTimeStamp;

  public readonly ctx: CanvasRenderingContext2D;

  public readonly dimensions: RenderingDimensions;

  /**
   * Initializes the rendering context.
   * @param ctx Canvas 2d context.
   * @param dimensions The dimensions of the rendering context
   * @param timestamp The size of the world that should be rendered
   */
  constructor(
    ctx: CanvasRenderingContext2D,
    dimensions: RenderingDimensions,
    timestamp: DOMHighResTimeStamp
  ) {
    this.ctx = ctx;
    this.dimensions = dimensions;

    this.currentTime = timestamp;
  }

  /**
   * Current target width to render.
   */
  get canvasWidth() {
    return this.dimensions.width;
  }

  /**
   * Current target width to render.
   */
  get canvasHeight() {
    return this.dimensions.height;
  }

  /**
   * Rotates the canvas by the passed number of degrees around the passed point,
   * executes the function and resets the context.
   * @param x Point to be rotated.
   * @param y Point to be rotated.
   * @param angle Degree to be rotated.
   * @param f Function.
   */
  translateAndRotate(x: number, y: number, angle: number, f: () => void) {
    // Cache context
    this.ctx.save();

    // Move origin
    this.ctx.translate(x, y);

    // Turn
    this.ctx.rotate((angle * Math.PI) / 180);

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
}

/**
 * Interface for an ObjectRenderer.
 */
interface ObjectRenderer<
  ContextType extends RenderingContext = RenderingContext,
  StateType = void
> {
  /**
   * Draws the object to the given context.
   * @param ctx RenderingContext
   * @param objectState the state of the object
   */
  draw(ctx: ContextType, objectState: StateType): void;
}

type ProgressableState<StateType> = { prev?: StateType; curr: StateType };

class ProgressiveWorldRenderingContext extends RenderingContext {
  public readonly animationTime: number;
  public readonly stateStartTime: DOMHighResTimeStamp;
  public readonly worldSize: Size;

  /** The step count up to the currently rendered state*/
  public readonly totalTimeSteps: number;

  /** The currently rendered state */
  public readonly currentState: WorldState;

  /** Value from 0 to 1, how far the current state has been rendered */
  public readonly stepProgress: number;

  public readonly tileWidth: number;
  public readonly tileHeight: number;

  constructor(
    totalTimeStep: number,
    currentState: WorldState,
    animationTime: number,
    stateStartTime: DOMHighResTimeStamp,
    worldSize: Size,
    base: RenderingContext
  ) {
    super(base.ctx, base.dimensions, base.currentTime);
    this.animationTime = animationTime;
    this.stateStartTime = stateStartTime;
    this.worldSize = worldSize;

    this.totalTimeSteps = totalTimeStep;
    this.currentState = currentState;

    const timeSinceStateStart = this.currentTime - this.stateStartTime;
    this.stepProgress = Math.min(
      Math.max(timeSinceStateStart / this.animationTime, 0),
      1
    );
    this.tileWidth = this.dimensions.width / this.worldSize.width;
    this.tileHeight = this.dimensions.height / this.worldSize.height;
  }
}

/**
 * Generic type to render with a iterating states objects (See: ObjectRenderer<>)
 * Most implementations will interpolate the progress between .prev and .curr by the stepProgress of the ctx
 */
type ProgressableObjectRenderer<StateType> = ObjectRenderer<
  ProgressiveWorldRenderingContext,
  ProgressableState<StateType>
>;

function drawProgressive<StateType>(
  renderer: ProgressableObjectRenderer<StateType>,
  ctx: ProgressiveWorldRenderingContext,
  curr: StateType,
  prev?: StateType
) {
  renderer.draw(ctx, { prev, curr });
}

class PreviewWorldRenderingContext extends RenderingContext {
  public readonly previewPulseInterval = 900; // ms

  /** The alpha amount that other preview objects that here to guide the user */
  public readonly otherObjectsGhostAlpha = 0.09; // 9% opacity

  public readonly subTileCrossAlpha = 0.5; // 50% opacity

  public readonly colorFilterColor = "#357fa7"; // blueish
  public readonly colorFilterAlpha = 0.6; // 60% opacity

  public readonly worldSize: Size;

  /** The currently rendered state */
  public readonly previewState: WorldState;

  public readonly tileWidth: number;
  public readonly tileHeight: number;

  constructor(
    previewState: WorldState,
    stateStartTime: DOMHighResTimeStamp,
    worldSize: Size,
    base: RenderingContext
  ) {
    super(base.ctx, base.dimensions, base.currentTime);
    this.worldSize = worldSize;

    this.previewState = previewState;

    this.tileWidth = this.dimensions.width / this.worldSize.width;
    this.tileHeight = this.dimensions.height / this.worldSize.height;
  }

  /**
   * Same as this.alpha but the alpha value is automatically calculated based on time.
   * Useful for preview rendering
   * @param f the function that should be called
   */
  public pulsingAlpha(f: () => void): void {
    const alpha = ((t: DOMHighResTimeStamp) => {
      const tn = (t % this.previewPulseInterval) / this.previewPulseInterval;
      // min(1, max(0, cos(x * 2 * pi)+0.5)) with x from 0 to 1
      return Math.min(1, Math.max(0, Math.cos(tn * 2 * Math.PI) + 0.5)) * 0.8;
    })(this.currentTime);

    this.alpha(alpha, f);
  }

  /**
   * Draws a cross at crossPos.
   * This might help the user to understand the subTilePos (direction) nature
   * @param crossPos The (tile)position where to draw the cross
   */
  public drawSubTilePosCrossHelper(crossPos: Position): void {
    this.alpha(this.subTileCrossAlpha, () => {
      this.translateAndRotate(
        crossPos.x * this.tileWidth,
        crossPos.y * this.tileHeight,
        0,
        () => {
          // Directly drawing a cross onto the canvas layer
          this.ctx.beginPath();
          this.ctx.strokeStyle = "black";
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(this.tileWidth, this.tileHeight);
          this.ctx.moveTo(0, this.tileHeight);
          this.ctx.lineTo(this.tileWidth, 0);
          this.ctx.stroke();
        }
      );
    });
  }

  /**
   * Provides a fresh temporary canvas for
   * @param f the function that receives the temp canvas
   */
  public useTempCanvasAsGhost(f: (tmpCtx: TemporaryRenderingContext) => void) {
    const tmpCtx = TemporaryRenderingContext.createTemporaryContext(this);

    tmpCtx.colorFilter(this.colorFilterColor, this.colorFilterAlpha, () => {
      f(tmpCtx);
    });

    this.pulsingAlpha(() => {
      tmpCtx.drawWholeCanvasOntoOtherCanvas(this);
    });
  }
}

class TemporaryRenderingContext extends RenderingContext {
  /* TODO: maybe extends from PreviewWorldRenderingContext ? */

  private readonly canvasElement: HTMLCanvasElement;

  public static createTemporaryContext(baseContext: RenderingContext) {
    const tmpCanvas = document.createElement("canvas") as HTMLCanvasElement;
    tmpCanvas.width = baseContext.canvasWidth;
    tmpCanvas.height = baseContext.canvasHeight;
    const tmpCtx = tmpCanvas.getContext("2d");
    return new TemporaryRenderingContext(
      tmpCanvas,
      tmpCtx,
      {
        width: tmpCanvas.width,
        height: tmpCanvas.height,
      },
      baseContext.currentTime
    );
  }

  constructor(
    canvasElement: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    dimensions: RenderingDimensions,
    timestamp: DOMHighResTimeStamp
  ) {
    super(ctx, dimensions, timestamp);
    this.canvasElement = canvasElement;
  }

  public drawWholeCanvasOntoOtherCanvas(ctx: RenderingContext): void {
    ctx.ctx.drawImage(
      this.canvasElement,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
  }

  public colorFilter(color: string, alpha: number, f: () => void): void {
    f();

    this.ctx.globalCompositeOperation = "source-atop";
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
}
/**
 * Generic type to render preview objects (See: ObjectRenderer<>)
 */
type PreviewObjectRenderer<StateType> = ObjectRenderer<
  PreviewWorldRenderingContext,
  StateType
>;

/**
 * Stateful renderer!
 * ObjectRenderer for a world.
 */
class WorldRenderer implements ObjectRenderer {
  /** The world to render */
  private readonly world: World;

  private readonly stateRenderer: WorldStateRenderer;
  private readonly previewStateRenderer: PreviewWorldStateRenderer;

  private currStep: number;
  private totalTimeSteps: number;
  private currState: WorldState;
  private prevState: WorldState;
  private lastRenderedStateStartTime?: DOMHighResTimeStamp; // Will be undefined if state recently changed

  /**
   * Initializes the WorldRenderer.
   */
  public constructor(world: World) {
    this.world = world;
    this.stateRenderer = new WorldStateRenderer();
    this.previewStateRenderer = new PreviewWorldStateRenderer();
  }

  private update(currentTime: DOMHighResTimeStamp) {
    const currState = this.world.state;
    const prevState = this.world.getState(this.world.step - 1);

    if (this.currState !== currState || this.prevState !== prevState) {
      if (
        this.world.step > this.currStep ||
        this.lastRenderedStateStartTime == undefined
      ) {
        // Render zero-timed states instantly
        this.lastRenderedStateStartTime =
          currState.time !== 0 ? currentTime : 0;
      } else if (this.world.step < this.currStep) {
        // We detected an UNDO operation, by setting the time to 0 all animations are done instantly
        this.lastRenderedStateStartTime = 0;
      }

      this.currState = currState;
      this.prevState = prevState;

      this.currStep = this.world.step;
      this.totalTimeSteps = this.world.totalTimeSteps;
    }
  }

  /**
   * Draws the world in the given context.
   * @param ctx RenderingContext.
   */
  public draw(ctx: RenderingContext) {
    this.update(ctx.currentTime);

    const worldCtx = new ProgressiveWorldRenderingContext(
      this.totalTimeSteps,
      this.currState,
      this.world.animationSpeed,
      this.lastRenderedStateStartTime,
      this.currState.size,
      ctx
    );

    // Draw current world
    drawProgressive(
      this.stateRenderer,
      worldCtx,
      this.currState,
      this.prevState
    );

    // Draw preview changes if available
    if (this.world.previewChanges) {
      const previewCtx = new PreviewWorldRenderingContext(
        this.currState,
        this.lastRenderedStateStartTime,
        this.currState.size,
        ctx
      );
      this.previewStateRenderer.draw(previewCtx, this.world.previewChanges);
    }
  }
}

abstract class GenericTruckRenderer {
  /** Duration of a turning signal interval in milliseconds. */
  readonly blinkerInterval = 700;

  /** Sprite for the truck. */
  truckSprite: Sprite;

  /** Sprite for the blinker. */
  turnSignalSprite: Sprite;

  /**
   * Initializes the TruckRenderer.
   */
  protected constructor() {
    // Sprites vorladen
    this.truckSprite = SpriteFactory.getSprite(
      "/vendor/truck/truck.svg",
      10,
      10
    );
    this.turnSignalSprite = SpriteFactory.getSprite(
      "/vendor/truck/turnSignal.svg",
      10,
      10
    );
  }

  /**
   * Calculates the center of the truck.
   * @param tileWidth Width of a tile.
   * @param tileHeight Height of a tile.
   * @param truckPos Position of the truck.
   * @param direction Facing direction of the truck.
   */
  protected static calculateTruckPosition(
    tileWidth: number,
    tileHeight: number,
    truckPos: Position,
    direction: Direction
  ): { x: number; y: number } {
    let truckPositionX = tileWidth * truckPos.x + tileWidth / 2;
    let truckPositionY = tileHeight * truckPos.y + tileHeight / 2;

    if (direction === Direction.North) {
      truckPositionY += tileHeight / 2;
    }
    if (direction === Direction.East) {
      truckPositionX -= tileWidth / 2;
    }
    if (direction === Direction.South) {
      truckPositionY -= tileHeight / 2;
    }
    if (direction === Direction.West) {
      truckPositionX += tileWidth / 2;
    }

    return { x: truckPositionX, y: truckPositionY };
  }

  /**
   * Calculates the rotation angle in degree of a truck.
   * @param truck Truck.
   */
  protected static calculateTruckAngle(truck: Truck): number {
    return DirectionUtil.directionToDegree(truck.facingDirection);
  }

  /**
   * Returns the number of the tile in the sprite, depending on the freight.
   * @param truck Truck to get the sprite number for.
   * @return Number of the tile in the sprite.
   */
  protected static truckSpriteNumber(truck: Truck): number {
    if (truck.freightColor() == null) {
      return 0;
    }
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
  protected static turnSignalSpriteNumber(truck: Truck): number {
    return {
      [TurnDirection.Straight]: 0,
      [TurnDirection.Left]: 1,
      [TurnDirection.Right]: 2,
    }[truck.turning];
  }
}

class TruckPreviewStateRenderer
  extends GenericTruckRenderer
  implements PreviewObjectRenderer<Truck>
{
  public constructor() {
    super();
  }

  draw(ctx: PreviewWorldRenderingContext, truck: Truck): void {
    // Calculate the height and width of the truck
    const truckWidth = ctx.tileWidth / 3;
    const truckHeight = ctx.tileHeight / 3;

    // Calculate the position of the truck
    let truckPosition = GenericTruckRenderer.calculateTruckPosition(
      ctx.tileWidth,
      ctx.tileHeight,
      truck.position,
      truck.facingDirection
    );
    let truckAngle = GenericTruckRenderer.calculateTruckAngle(truck);
    let turnSignalSpriteNumber =
      GenericTruckRenderer.turnSignalSpriteNumber(truck);

    ctx.useTempCanvasAsGhost((tmpCtx) => {
      tmpCtx.translateAndRotate(
        truckPosition.x,
        truckPosition.y,
        truckAngle,
        () => {
          // Turn signal
          this.turnSignalSprite.draw(
            tmpCtx,
            turnSignalSpriteNumber,
            -(truckWidth / 2),
            -(truckHeight / 2),
            truckWidth,
            truckHeight
          );

          // truck
          this.truckSprite.draw(
            tmpCtx,
            TruckRenderer.truckSpriteNumber(truck),
            -(truckWidth / 2),
            -(truckHeight / 2),
            truckWidth,
            truckHeight
          );
        }
      );
    });

    // Figuring out where the cross should be located
    // (the tile that is behind the truck)
    const crossPos = DirectionUtil.stepInDirection(
      truck.position,
      DirectionUtil.opposite(truck.facingDirection)
    );
    ctx.drawSubTilePosCrossHelper(crossPos);

    // Drawing the possible truck positions in a lower alpha value
    ctx.alpha(ctx.otherObjectsGhostAlpha, () => {
      const tile = ctx.previewState.getTile(crossPos);

      DirectionUtil.forEachDirection((direction) => {
        if (tile.hasOpeningInDirection(direction)) {
          const rot = DirectionUtil.directionToDegree(direction);
          const tmpPos = GenericTruckRenderer.calculateTruckPosition(
            ctx.tileWidth,
            ctx.tileHeight,
            crossPos,
            DirectionUtil.opposite(direction)
          );

          ctx.translateAndRotate(tmpPos.x, tmpPos.y, rot, () => {
            this.truckSprite.drawDirect(
              ctx.ctx,
              0,
              -(truckWidth / 2),
              -(truckHeight / 2),
              truckWidth,
              truckHeight
            );
          });
        }
      });
    });
  }
}

class PreviewWorldStateRenderer
  implements PreviewObjectRenderer<WorldPreviewInfo>
{
  readonly previewTruckRenderer: TruckPreviewStateRenderer;
  readonly previewTileRenderer: TilePreviewRenderer;

  constructor() {
    this.previewTruckRenderer = new TruckPreviewStateRenderer();
    this.previewTileRenderer = new TilePreviewRenderer();
  }

  public draw(
    ctx: PreviewWorldRenderingContext,
    preview: WorldPreviewInfo
  ): void {
    const tilesFieldName = nameof<typeof preview.state>("tiles");
    for (let i = 0; i < preview.state.tiles.length; i++) {
      const tilePatch = preview.patches.find(
        (patch) => patch.path[0] === tilesFieldName && patch.path[1] === i
      );

      if (tilePatch) {
        // This tile was changed in the preview
        const tile = preview.state.tiles[i];

        const renderOpenings =
          tilePatch.path[2] ===
          nameof<typeof preview.state.tiles[0]>("openings");
        const renderFreight =
          tilePatch.path[2] ===
          nameof<typeof preview.state.tiles[0]>("freight");
        const renderFreightTarget =
          tilePatch.path[2] ===
          nameof<typeof preview.state.tiles[0]>("freightTarget");
        const hasTrafficLightsChange =
          tilePatch.path[2] ===
          nameof<typeof preview.state.tiles[0]>("trafficLights");
        const renderTrafficLights = [];
        if (hasTrafficLightsChange) {
          renderTrafficLights.push(tilePatch.path[3] as number);
        }

        this.previewTileRenderer.draw(ctx, {
          tile,
          renderOpenings,
          renderFreight,
          renderFreightTarget,
          renderTrafficLights,
        });
      }
    }

    const truckFieldName = nameof<typeof preview.state>("truck");
    const hasTruckPatch = !!preview.patches.find(
      (patch) => patch.path[0] === truckFieldName
    );
    if (hasTruckPatch && preview.state.truck) {
      this.previewTruckRenderer.draw(ctx, preview.state.truck);
    }
  }
}

/**
 * ObjectRenderer for a world state.
 */
class WorldStateRenderer implements ProgressableObjectRenderer<WorldState> {
  readonly tileRenderer: TileRenderer;
  readonly truckRenderer: TruckRenderer;

  constructor() {
    this.tileRenderer = new TileRenderer();
    this.truckRenderer = new TruckRenderer();
  }

  /**
   * Draws the world state in the passed context.
   * @param ctx RenderingContext.
   * @param states The previous state and the world state (are used to the interpolate truck)
   */
  public draw(
    ctx: ProgressiveWorldRenderingContext,
    { prev, curr }: ProgressableState<WorldState>
  ) {
    // prev tiles are only supported if the size is equal to the old world size
    const prevTiles = prev?.size.isEqual(curr.size) ? prev.tiles : null;
    for (let i = 0; i < curr.tiles.length; i++) {
      drawProgressive(this.tileRenderer, ctx, curr.tiles[i], prevTiles?.[i]);
    }

    drawProgressive(this.truckRenderer, ctx, curr.truck, prev?.truck);
  }
}

class GenericTileRenderer {
  /** Sprite for the tile background. */
  tileSprite: Sprite;

  /** Sprite for the traffic lights. */
  trafficLightSprite: Sprite;

  /** Sprite for freight and fright targets. */
  freightSprite: Sprite;

  /** Overlap of the tile to avoid ugly edges. */
  pixelOverlap = -1;

  protected constructor() {
    // Preload Sprites
    this.tileSprite = SpriteFactory.getSprite(
      "/vendor/truck/tiles.svg",
      64,
      64
    );
    this.trafficLightSprite = SpriteFactory.getSprite(
      "/vendor/truck/trafficLight.svg",
      10,
      10
    );
    this.freightSprite = SpriteFactory.getSprite(
      "/vendor/truck/freight.svg",
      10,
      10
    );
  }

  /**
   * Returns the number of the tile in the sprite, depending on the requested
   * openings.
   * @return Number of the tile in the sprite.
   */
  protected static tileSpriteNumber(tile: Tile): number {
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

      [TileOpening.North |
      TileOpening.East |
      TileOpening.South |
      TileOpening.West]: 15,
    }[tile.openings];
  }

  /**
   * Returns the number of the tile in the sprite, depending on the requested
   * freight.
   * @param tile Tile to get the sprite number for.
   * @return Number of the tile in the sprite.
   */
  protected static freightSpriteNumber(tile: Tile): number {
    return {
      red: 0,
      green: 2,
      blue: 4,
    }[tile.freightColor()];
  }

  /**
   * Returns the number of the tile in the sprite depending on the requested
   * target.
   * @param tile Tile to get the sprite number for.
   * @return Number of the tile in the sprite.
   */
  protected static freightTargetSpriteNumber(tile: Tile): number {
    return {
      red: 1,
      green: 3,
      blue: 5,
    }[tile.freightColor()];
  }
}

interface TileRenderInfo {
  tile: Tile;

  renderOpenings: boolean;
  renderFreight: boolean;
  renderFreightTarget: boolean;

  // The array indices of traffic light that need should be rendered
  renderTrafficLights: number[];
}

class TilePreviewRenderer
  extends GenericTileRenderer
  implements PreviewObjectRenderer<TileRenderInfo>
{
  public constructor() {
    super();
  }

  private drawPreviewFreights(
    ctx: PreviewWorldRenderingContext,
    tile: Tile
  ): void {
    ctx.useTempCanvasAsGhost((tmpCtx) => {
      this.freightSprite.draw(
        tmpCtx,
        TileRenderer.freightSpriteNumber(tile),
        ctx.tileWidth * tile.position.x - this.pixelOverlap,
        ctx.tileWidth * tile.position.y - this.pixelOverlap,
        ctx.tileWidth + this.pixelOverlap * 2,
        ctx.tileHeight + this.pixelOverlap * 2
      );
    });
  }

  private drawPreviewFreightTarget(
    ctx: PreviewWorldRenderingContext,
    tile: Tile
  ): void {
    ctx.useTempCanvasAsGhost((tmpCtx) => {
      this.freightSprite.draw(
        tmpCtx,
        TileRenderer.freightTargetSpriteNumber(tile),
        ctx.tileWidth * tile.position.x - this.pixelOverlap,
        ctx.tileWidth * tile.position.y - this.pixelOverlap,
        ctx.tileWidth + this.pixelOverlap * 2,
        ctx.tileHeight + this.pixelOverlap * 2
      );
    });
  }

  private drawPreviewTrafficLights(
    ctx: PreviewWorldRenderingContext,
    tile: Tile,
    whichOne: number[]
  ): void {
    tile.trafficLights.forEach((tl, i) => {
      if (tl != null) {
        if (whichOne.includes(i)) {
          // Switch traffic light on half of the step
          const isGreen = tl.isGreen(0);

          ctx.useTempCanvasAsGhost((tmpCtx) => {
            this.trafficLightSprite.draw(
              tmpCtx,
              i * 2 + (isGreen ? 1 : 0),
              ctx.tileWidth * tile.position.x - this.pixelOverlap,
              ctx.tileWidth * tile.position.y - this.pixelOverlap,
              ctx.tileWidth + this.pixelOverlap * 2,
              ctx.tileHeight + this.pixelOverlap * 2
            );
          });
        }
      } else if (
        tile.hasOpeningInDirection(Tile.trafficLightIndexToDirection(i))
      ) {
        // If there is no traffic light
        // we want to show that is it possible to place one there
        const isGreen = 1;
        ctx.alpha(ctx.otherObjectsGhostAlpha, () => {
          this.trafficLightSprite.draw(
            ctx,
            i * 2 + isGreen,
            ctx.tileWidth * tile.position.x - this.pixelOverlap,
            ctx.tileWidth * tile.position.y - this.pixelOverlap,
            ctx.tileWidth + this.pixelOverlap * 2,
            ctx.tileHeight + this.pixelOverlap * 2
          );
        });
      }
    });

    ctx.drawSubTilePosCrossHelper(tile.position);
  }

  public draw(
    ctx: PreviewWorldRenderingContext,
    renderInfo: TileRenderInfo
  ): void {
    const tile = renderInfo.tile;

    // Draw road
    if (renderInfo.renderOpenings) {
      // To supports roads we need to split each road into its subparts
      // in order to not overlay them in the preview
      console.warn("Drawing road in preview mode is unsupported.");
    }

    if (renderInfo.renderFreight) {
      this.drawPreviewFreights(ctx, tile);
    }

    if (renderInfo.renderFreightTarget) {
      this.drawPreviewFreightTarget(ctx, tile);
    }

    if (renderInfo.renderTrafficLights.length) {
      this.drawPreviewTrafficLights(ctx, tile, renderInfo.renderTrafficLights);
    }
  }
}

/**
 * ObjectRenderer for a tile.
 */
class TileRenderer
  extends GenericTileRenderer
  implements ProgressableObjectRenderer<Tile>
{
  public constructor() {
    super();
  }

  /**
   * Draws the tile in the given context.
   * @param ctx RenderingContext.
   * @param states The previous state and the world state (are used to the interpolate traffic light)
   */
  public draw(
    ctx: ProgressiveWorldRenderingContext,
    { prev: prevTile, curr: tile }: ProgressableState<Tile>
  ) {
    // Calculate the freight alpha value
    const freightAlpha =
      ctx.stepProgress < 1 && prevTile?.freightItems !== tile.freightItems
        ? ctx.stepProgress
        : 1;

    // Draw road
    this.tileSprite.draw(
      ctx,
      TileRenderer.tileSpriteNumber(tile),
      ctx.tileWidth * tile.position.x - this.pixelOverlap,
      ctx.tileHeight * tile.position.y - this.pixelOverlap,
      ctx.tileWidth + this.pixelOverlap * 2,
      ctx.tileHeight + this.pixelOverlap * 2
    );

    // Draw traffic lights
    tile.trafficLights.forEach((tl, i) => {
      if (tl != null) {
        // Switch traffic light on half of the step
        const isGreen = tl.isGreen(
          Math.max(
            0,
            ctx.stepProgress < 0.5 ? ctx.totalTimeSteps - 1 : ctx.totalTimeSteps
          )
        );

        this.trafficLightSprite.draw(
          ctx,
          i * 2 + (isGreen ? 1 : 0),
          ctx.tileWidth * tile.position.x - this.pixelOverlap,
          ctx.tileWidth * tile.position.y - this.pixelOverlap,
          ctx.tileWidth + this.pixelOverlap * 2,
          ctx.tileHeight + this.pixelOverlap * 2
        );
      }
    });

    // Draw old freight
    if (prevTile && prevTile.freightItems > 0 && freightAlpha < 1) {
      ctx.alpha(1 - freightAlpha, () => {
        this.freightSprite.draw(
          ctx,
          TileRenderer.freightSpriteNumber(prevTile),
          ctx.tileWidth * tile.position.x - this.pixelOverlap,
          ctx.tileWidth * tile.position.y - this.pixelOverlap,
          ctx.tileWidth + this.pixelOverlap * 2,
          ctx.tileHeight + this.pixelOverlap * 2
        );
      });
    }

    // Draw new freight
    if (tile.freightItems > 0) {
      ctx.alpha(freightAlpha, () => {
        this.freightSprite.draw(
          ctx,
          TileRenderer.freightSpriteNumber(tile),
          ctx.tileWidth * tile.position.x - this.pixelOverlap,
          ctx.tileWidth * tile.position.y - this.pixelOverlap,
          ctx.tileWidth + this.pixelOverlap * 2,
          ctx.tileHeight + this.pixelOverlap * 2
        );
      });
    }

    // Draw targets
    if (tile.freightTarget != null) {
      this.freightSprite.draw(
        ctx,
        TileRenderer.freightTargetSpriteNumber(tile),
        ctx.tileWidth * tile.position.x - this.pixelOverlap,
        ctx.tileWidth * tile.position.y - this.pixelOverlap,
        ctx.tileWidth + this.pixelOverlap * 2,
        ctx.tileHeight + this.pixelOverlap * 2
      );
    }

    // Possibly draw a "truck is here"-marker (outline the tile blue)
    if (tile.position.isEqual(ctx.currentState.truck.position)) {
      // ctx.ctx.strokeStyle = `hsl(${this.parent.state.time}, 100, 50)`;
      ctx.ctx.strokeStyle = "blue";
      ctx.ctx.strokeRect(
        ctx.tileWidth * tile.position.x - this.pixelOverlap,
        ctx.tileWidth * tile.position.y - this.pixelOverlap,
        ctx.tileWidth + this.pixelOverlap * 2,
        ctx.tileHeight + this.pixelOverlap * 2
      );
    }
  }
}

/**
 * ObjectRenderer of a truck.
 */
class TruckRenderer
  extends GenericTruckRenderer
  implements ProgressableObjectRenderer<Truck>
{
  public constructor() {
    super();
  }

  /**
   * Draws the truck in the given context.
   * @param ctx RenderingContext.
   * @param prevTruck
   * @param truck
   */
  draw(
    ctx: ProgressiveWorldRenderingContext,
    { prev: prevTruck, curr: truck }: ProgressableState<Truck>
  ) {
    // Calculate the height and width of the truck
    const truckWidth = ctx.tileWidth / 3;
    const truckHeight = ctx.tileHeight / 3;

    // Calculate the position of the truck
    let truckPosition = GenericTruckRenderer.calculateTruckPosition(
      ctx.tileWidth,
      ctx.tileHeight,
      truck.position,
      truck.facingDirection
    );
    let truckAngle = GenericTruckRenderer.calculateTruckAngle(truck);
    let turnSignalSpriteNumber =
      GenericTruckRenderer.turnSignalSpriteNumber(truck);

    // Current Truck is fully visible by default
    let truckAlpha = 1;

    if (prevTruck) {
      const t = ctx.stepProgress;
      // Interpolate if animation is not finished yet and truck has changed its
      // position between states
      if (
        t < 1 &&
        (truck.position !== prevTruck.position ||
          truck.facing !== prevTruck.facing)
      ) {
        // Calculate position of previous truck
        const prevTruckPosition = GenericTruckRenderer.calculateTruckPosition(
          ctx.tileWidth,
          ctx.tileHeight,
          prevTruck.position,
          prevTruck.facingDirection
        );
        const prevTruckAngle =
          GenericTruckRenderer.calculateTruckAngle(prevTruck);

        if (truck.facing !== prevTruck.facing) {
          const p0 = prevTruckPosition;
          const p1 = {
            x: ctx.tileWidth * prevTruck.position.x + ctx.tileWidth / 2,
            y: ctx.tileHeight * prevTruck.position.y + ctx.tileHeight / 2,
          };
          const p2 = truckPosition;
          // De Casteljau
          truckPosition = {
            x: (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x,
            y: (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y,
          };
        } else {
          // Interpolate position
          truckPosition.x =
            prevTruckPosition.x + (truckPosition.x - prevTruckPosition.x) * t;
          truckPosition.y =
            prevTruckPosition.y + (truckPosition.y - prevTruckPosition.y) * t;
        }

        // Interpolate angle
        truckAngle = prevTruckAngle + (truckAngle - prevTruckAngle) * t;

        // If necessary, leave the turn signal on as long as truck is turning
        if (prevTruck.turning !== TurnDirection.Straight) {
          turnSignalSpriteNumber =
            TruckRenderer.turnSignalSpriteNumber(prevTruck);
        }
      }

      if (t <= 1 && truck.freightColor() !== prevTruck.freightColor()) {
        truckAlpha = t;
      }
    }

    // Calculate the alpha value for the turn signal
    const turnSignalAlpha = ((t: DOMHighResTimeStamp) => {
      const tn = (t % this.blinkerInterval) / this.blinkerInterval;
      // min(1, max(0, cos(x * 2 * pi)+0.5)) with x from 0 to 1
      return Math.min(1, Math.max(0, Math.cos(tn * 2 * Math.PI) + 0.5));
    })(ctx.currentTime);

    ctx.translateAndRotate(truckPosition.x, truckPosition.y, truckAngle, () => {
      // Turn signal
      ctx.alpha(turnSignalAlpha, () => {
        this.turnSignalSprite.draw(
          ctx,
          turnSignalSpriteNumber,
          -(truckWidth / 2),
          -(truckHeight / 2),
          truckWidth,
          truckHeight
        );
      });

      // Old truck
      if (truckAlpha < 1) {
        ctx.alpha(1 - truckAlpha, () => {
          this.truckSprite.draw(
            ctx,
            TruckRenderer.truckSpriteNumber(prevTruck),
            -(truckWidth / 2),
            -(truckHeight / 2),
            truckWidth,
            truckHeight
          );
        });
      }

      // New truck
      ctx.alpha(truckAlpha, () => {
        this.truckSprite.draw(
          ctx,
          TruckRenderer.truckSpriteNumber(truck),
          -(truckWidth / 2),
          -(truckHeight / 2),
          truckWidth,
          truckHeight
        );
      });
    });
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
  public readonly path: string;

  /** Image element for drawing on a canvas. */
  private readonly image: HTMLImageElement = new Image();

  /** Width of a single tile in the sprite. */
  public readonly width: number;

  /** Height of a single tile in the sprite. */
  public readonly height: number;

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
  draw(
    ctx: RenderingContext,
    number: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
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

  drawDirect(
    ctx: CanvasRenderingContext2D,
    number: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.drawImage(
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
