import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFormBuyComponent } from './modal-form-buy.component';

describe('ModalFormBuyComponent', () => {
  let component: ModalFormBuyComponent;
  let fixture: ComponentFixture<ModalFormBuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFormBuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFormBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
