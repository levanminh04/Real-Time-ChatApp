import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarModalComponentComponent } from './avatar-modal-component.component';

describe('AvatarModalComponentComponent', () => {
  let component: AvatarModalComponentComponent;
  let fixture: ComponentFixture<AvatarModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarModalComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
