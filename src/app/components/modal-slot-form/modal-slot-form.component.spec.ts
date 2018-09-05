import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSlotFormComponent } from './modal-slot-form.component';

describe('ModalSlotFormComponent', () => {
  let component: ModalSlotFormComponent;
  let fixture: ComponentFixture<ModalSlotFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSlotFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSlotFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
