import { Component, OnInit } from '@angular/core';
import { Title, Meta} from '@angular/platform-browser';
import { Constants } from '../../constants';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  public Constants: typeof Constants;

  constructor(public _Title: Title, public _Meta: Meta) {
    this.Constants = Constants;
  }

  ngOnInit() {
    this._Title.setTitle('Frequently asked questions - The EOS Wall');
    this._Meta.addTags([
      { name: 'description', content: `This are some frequently asked questions (FAQ) about the wall.` },
      { name: 'author', content: 'The EOS Wall' },
      { name: 'keywords', content: 'EOS, wall, faq, frecuently asked questions' }
    ]);
  }

}
