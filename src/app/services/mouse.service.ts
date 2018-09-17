import { WINDOW } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MouseService {

  public mouseMove: Observable<Event>;
  public mouseUp: Observable<Event>;
  constructor(@Inject(WINDOW) private window: Window, ) {
    this.mouseMove = fromEvent(window, 'mousemove');
    this.mouseUp = fromEvent(window, 'mouseup');
   }
}
