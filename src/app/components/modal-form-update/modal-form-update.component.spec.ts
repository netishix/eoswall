import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFormUpdateComponent } from './modal-form-update.component';

describe('ModalFormUpdateComponent', () => {
  let component: ModalFormUpdateComponent;
  let fixture: ComponentFixture<ModalFormUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFormUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFormUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
