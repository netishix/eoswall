import { Component, OnInit } from '@angular/core';
import { Constants } from '../../constants';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  private Constants;

  constructor() { }

  ngOnInit() {
    this.Constants = Constants;
  }

}
