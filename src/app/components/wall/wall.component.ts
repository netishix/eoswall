import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MouseService } from '../../services/mouse.service';
import { Constants } from '../../constants';
import { Asset } from '../../lib/asset';
import { Coordinate, Slot, SlotDescription } from '../../types';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.scss']
})
export class WallComponent implements OnInit, OnChanges {

  @Input() isLoading: boolean;
  @Input() slots: Slot[];
  @Input() isBuying: boolean;
  @Input() isUpdating: boolean;
  @Output() buy: EventEmitter<SlotDescription> = new EventEmitter();
  @Output() update: EventEmitter<{slot: Slot, slotDescription: SlotDescription}> = new EventEmitter();

  public selection: {
      intersects: boolean;
      c1: Coordinate;
      c2: Coordinate;
      mousedown: 'm' | 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l';
      moved: {
        x: number,
        y: number
      };
      description: SlotDescription;
      onMouseMove: Function;
      onMouseUp: Function;
    } = {
      intersects: false,
      c1: null,
      c2: null,
      mousedown: null,
      moved: {
        x: 0,
        y: 0
      },
      description: {
        c1: null,
        c2: null,
        position: null,
        size: null,
        surface: null,
        price: null
      },
      onMouseMove: (event): void => {
        if (this.selection.mousedown) {
          this.selection.moved.x += event.movementX;
          this.selection.moved.y += event.movementY;
          const moveX = (Math.trunc(this.selection.moved.x / Constants.wall.minOrderPixels) * Constants.wall.minOrderPixels);
          const moveY = (Math.trunc(this.selection.moved.y / Constants.wall.minOrderPixels) * Constants.wall.minOrderPixels);
          const newC1: Coordinate = [this.selection.c1[0], this.selection.c1[1]];
          const newC2: Coordinate = [this.selection.c2[0], this.selection.c2[1]];
          switch (this.selection.mousedown) {
            case 'm':
              newC1[0] += moveX;
              newC1[1] += moveY;
              newC2[0] += moveX;
              newC2[1] += moveY;
              break;
            case 'tl':
              newC1[0] += moveX;
              newC1[1] += moveY;
              break;
            case 't':
              newC1[1] += moveY;
              break;
            case 'tr':
              newC2[0] += moveX;
              newC1[1] += moveY;
              break;
            case 'r':
              newC2[0] += moveX;
              break;
            case 'br':
              newC2[0] += moveX;
              newC2[1] += moveY;
              break;
            case 'b':
              newC2[1] += moveY;
              break;
            case 'bl':
              newC1[0] += moveX;
              newC2[1] += moveY;
              break;
            case 'l':
              newC1[0] += moveX;
              break;
          }
          if (this.areCoordinatesValid(newC1, newC2)) {
            this.selection.c1 = newC1;
            this.selection.c2 = newC2;
            if (moveX !== 0) {
              this.selection.moved.x = 0;
            }
            if (moveY !== 0) {
              this.selection.moved.y = 0;
            }
            this.selection.intersects = false;
          }
        }
      },
      onMouseUp: () => {
        if (this.selection.mousedown) {
          this.selection.mousedown = null;
          this.selection.intersects = this.intersects(this.selection.c1, this.selection.c2);
          this.selection.description = this.getSlotDescription(this.selection.c1, this.selection.c2);
        }
      }
    };

  constructor(public _AuthService: AuthService, public _MouseService: MouseService) { }

  ngOnInit() {
    this._MouseService.mouseMove.subscribe((event) => {
      this.selection.onMouseMove(event);
    });
    this._MouseService.mouseUp.subscribe((event) => {
      this.selection.onMouseUp(event);
    });
  }

  ngOnChanges(changes) {
    if (changes.isBuying && changes.isBuying.currentValue) {
      this.selection.c1 = [830, 70];
      this.selection.c2 = [850, 90];
      this.selection.description = this.getSlotDescription(this.selection.c1, this.selection.c2);
      this.selection.intersects = this.intersects(this.selection.c1, this.selection.c2);
    }
  }

  private getWidth(c1, c2): number {
    return c2[0] - c1[0];
  }
  private getHeight(c1, c2): number {
    return c2[1] - c1[1];
  }
  private getTotalPixels(c1, c2): number {
    return this.getWidth(c1, c2) * this.getHeight(c1, c2);
  }
  private calculatePrice(c1, c2): Asset {
    const amount = Constants.wall.pixelPrice * this.getTotalPixels(c1, c2);
    const asset = new Asset(amount, Constants.network.symbol);
    return asset;
  }
  private getPositionStyle(c1, c2): { left: string, top: string, right: string, bottom: string } {
    const style = {
      left: c1[0] + 'px',
      top: c1[1] + 'px',
      right: (Constants.wall.wallWidth - c2[0]) + 'px',
      bottom: (Constants.wall.wallHeight - c2[1]) + 'px',
    };
    return style;
  }
  private getSlotDescription(c1, c2): SlotDescription {
    const description = {
      c1: c1,
      c2: c2,
      size: `${this.getWidth(c1, c2)}x${this.getHeight(c1, c2)}`,
      position: `${c1[0]},${c1[1]}`,
      surface: this.getTotalPixels(c1, c2),
      price: this.calculatePrice(c1, c2)
    };
    return description;
  }
  private intersects(c1, c2): boolean {
    const intersectedSlots = [];
    for (const slot of this.slots) {
      if ( c1[0] < slot.c2[0] && c2[0] > slot.c1[0] && c1[1] < slot.c2[1] && c2[1] > slot.c1[1]) {
        intersectedSlots.push(slot);
      }
    }
    return (intersectedSlots.length > 0);
  }
  private areCoordinatesValid(c1, c2): boolean {
    // is inside the wall?
    const condition1 = (
      c1[0] >= 0 && c1[0] <= Constants.wall.wallWidth && c1[1] >= 0 && c1[1] <= Constants.wall.wallHeight &&
      c2[0] >= 0 && c2[0] <= Constants.wall.wallWidth && c2[1] >= 0 && c2[1] <= Constants.wall.wallHeight
    );
    // has minimum dimensions
    const condition2 = (this.getWidth(c1, c2) >= Constants.wall.minOrderPixels && this.getHeight(c1, c2) >= Constants.wall.minOrderPixels);
    const valid = (condition1 && condition2);
    return valid;
  }

  public selectSlot(): void {
    this.buy.emit(this.selection.description);
  }

  public slotClick(slot): void {
    if (!this.isBuying && !this.isUpdating) {
      let url = slot.url;
      if (!/^[a-z0-9]+:\/\//.test(url)) {
        url = 'http://' + slot.url;
      }
      window.open(url);
    } else if (this.isUpdating) {
      const description = this.getSlotDescription(slot.c1, slot.c2);
      const data = {
        slot: slot,
        slotDescription: description
      };
      this.update.emit(data);
    }
  }

}
