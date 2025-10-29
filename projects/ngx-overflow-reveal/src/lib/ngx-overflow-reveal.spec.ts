import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxOverflowReveal } from './ngx-overflow-reveal';

describe('NgxOverflowReveal', () => {
  let component: NgxOverflowReveal;
  let fixture: ComponentFixture<NgxOverflowReveal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxOverflowReveal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxOverflowReveal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
