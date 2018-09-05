import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MouseService {

  public mouseMove = fromEvent(window, 'mousemove');
  public mouseUp = fromEvent(window, 'mouseup');
  constructor() { }
}
