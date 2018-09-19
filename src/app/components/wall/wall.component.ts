import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, OnChanges, Input, Output, EventEmitter , Inject} from '@angular/core';
import { MouseService } from '../../services/mouse.service';
import { Constants } from '../../constants';
import { Slot } from '../../lib/slot';
import { Asset } from '../../lib/asset';
import { Coordinate } from '../../types';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.scss']
})
export class WallComponent implements OnInit, OnChanges {

  @Input() isLoading: boolean;
  @Input() slots: Slot[];
  @Input() pixelPrice: number;
  @Input() isBuying: boolean;
  @Input() isUpdating: boolean;
  @Output() buy: EventEmitter<Slot> = new EventEmitter();
  @Output() update: EventEmitter<Slot> = new EventEmitter();

  public selection: {
      slot: Slot;
      intersects: boolean;
      exceeded: boolean;
      mousedown: 'm' | 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l';
      moved: {
        x: number,
        y: number
      };
      onMouseMove: Function;
      onMouseUp: Function;
    } = {
      slot: null,
      intersects: false,
      exceeded: false,
      mousedown: null,
      moved: {
        x: 0,
        y: 0
      },
      onMouseMove: (event): void => {
        if (this.selection.mousedown) {
          this.selection.moved.x += event.movementX;
          this.selection.moved.y += event.movementY;
          const moveX = (Math.trunc(this.selection.moved.x / Constants.wall.minOrderPixels) * Constants.wall.minOrderPixels);
          const moveY = (Math.trunc(this.selection.moved.y / Constants.wall.minOrderPixels) * Constants.wall.minOrderPixels);
          const newC1: Coordinate = [this.selection.slot.c1[0], this.selection.slot.c1[1]];
          const newC2: Coordinate = [this.selection.slot.c2[0], this.selection.slot.c2[1]];
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
          const newSlot = new Slot({
            c1: newC1,
            c2: newC2,
            pixelPrice: this.pixelPrice
          });
          if (newSlot.areCoordinatesValid()) {
            this.selection.slot = newSlot;
            this.selection.exceeded = this.exceeds(this.selection.slot.c1, this.selection.slot.c2);
            this.selection.intersects = false;
            if (moveX !== 0) {
              this.selection.moved.x = 0;
            }
            if (moveY !== 0) {
              this.selection.moved.y = 0;
            }
          }
        }
      },
      onMouseUp: () => {
        if (this.selection.mousedown) {
          this.selection.mousedown = null;
          this.selection.intersects = this.intersects(this.selection.slot.c1, this.selection.slot.c2);
        }
      }
    };

  constructor(@Inject(WINDOW) private window: Window, public _MouseService: MouseService) { }

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
      const initialCoordinates = this.findAvailableCoordinates();
      this.selection.slot = new Slot({
        c1: initialCoordinates.c1,
        c2: initialCoordinates.c2,
        pixelPrice: this.pixelPrice
      });
      this.selection.intersects = this.intersects(this.selection.slot.c1, this.selection.slot.c2);
    }
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

  private exceeds(c1, c2) {
    const slot = new Slot({
      c1: c1,
      c2: c2
    });
    return slot.pixels > (Constants.wall.maxOrderPixels * Constants.wall.maxOrderPixels);
  }

  private findAvailableCoordinates() {
    const available = false;
    let i = 0;
    do {
      const x1 = Math.floor(Math.random() * 1000) + 1;
      const y1 = Math.floor(Math.random() * 500) + 1;
      const c1 = [x1, y1];
      const c2 = [x1 + 30, y1 + 20];
      if (!this.intersects(c1, c2) && !this.exceeds(c1, c2)) {
        return {c1, c2};
      } else {
        if (i >= 100) {
          return {c1, c2};
        } else {
          i++;
        }
      }
    }
    while (!available);
  }

  public selectSlot(): void {
    this.buy.emit(this.selection.slot);
  }

  public slotClick(slot): void {
    if (!this.isBuying && !this.isUpdating) {
      let url = slot.url;
      if (!/^[a-z0-9]+:\/\//.test(url)) {
        url = 'http://' + slot.url;
      }
      this.window.open(url);
    } else if (this.isUpdating) {
      this.update.emit(slot);
    }
  }

}
