import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { WindowRef } from "./window-ref.service";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class MouseService {

  public mouseMove?: Observable<Event>;
  public mouseUp?: Observable<Event>;
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private windowRef: WindowRef
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.mouseMove = fromEvent(windowRef.nativeWindow, 'mousemove');
      this.mouseUp = fromEvent(windowRef.nativeWindow, 'mouseup');
    }
   }
}
