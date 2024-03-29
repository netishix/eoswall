import { Constants } from '../constants';
import { Coordinate } from '../types';
import { Asset } from './asset';

export class Slot {

  public id: number;
  public c1: Coordinate;
  public c2: Coordinate;
  public width: number;
  public height: number;
  public pixels: number;
  public cssPosition: { left: string, top: string, right: string, bottom: string };
  public price?: Asset;
  public title: string | null;
  public imageUrl: string | null;
  public url: string;
  public owner: string | null;

  constructor(settings: any) {
    this.id = settings.id;
    this.c1 = settings.c1;
    this.c2 = settings.c2;
    this.title = settings.title || null;
    this.imageUrl = settings.imageUrl || null;
    this.url = !/^[a-z0-9]+:\/\//.test(settings.url) ? 'http://' + settings.url : settings.url;
    this.owner = settings.owner || null;
    this.width = this.c2[0] - this.c1[0];
    this.height = this.c2[1] - this.c1[1];
    this.pixels = this.width * this.height;
    this.cssPosition = {
      left: this.c1[0] + 'px',
      top: this.c1[1] + 'px',
      right: (Constants.wall.wallWidth - this.c2[0]) + 'px',
      bottom: (Constants.wall.wallHeight - this.c2[1]) + 'px',
    };
    if (settings.pixelPrice) {
      this.setPrice(settings.pixelPrice);
    }
  }

  static calculatePixelPrice(pixelsSold: number) {
    const wallPixels = Constants.wall.wallWidth * Constants.wall.wallHeight;
    const slope = (pixelsSold <= 800000) ? (0.0015 / wallPixels) : (0.003 / wallPixels);
    return (slope * pixelsSold) + 0.0005;
  }

  public setPrice(pixelPrice: number): void {
    const amount = pixelPrice * this.pixels;
    this.price = new Asset(amount, Constants.network.symbol);
  }

  public areCoordinatesValid(): boolean {
    // is inside the wall?
    const condition1 = (
      this.c1[0] >= 0 && this.c1[0] <= Constants.wall.wallWidth && this.c1[1] >= 0 && this.c1[1] <= Constants.wall.wallHeight &&
      this.c2[0] >= 0 && this.c2[0] <= Constants.wall.wallWidth && this.c2[1] >= 0 && this.c2[1] <= Constants.wall.wallHeight
    );
    // has minimum dimensions
    const condition2 = (this.width >= Constants.wall.minOrderPixels && this.height >= Constants.wall.minOrderPixels);
    return (condition1 && condition2);
  }

  public getProxyImageUrl() {
    return `/proxy/image?url=${this.imageUrl}`
  }
}
