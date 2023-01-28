import { Component, OnInit } from '@angular/core';
import { Title, Meta} from '@angular/platform-browser';

@Component({
  selector: 'app-why',
  templateUrl: './why.component.html',
  styleUrls: ['./why.component.css']
})
export class WhyComponent implements OnInit {

  constructor(public _Title: Title, public _Meta: Meta) { }

  ngOnInit() {
    this._Title.setTitle('Why? - The EOS Wall');
    this._Meta.addTags([
      { name: 'description', content: `The EOS Wall project was born as a proof of concept of EOSIO DAPP.
      Every user that has an EOSIO account can buy a portion of the wall called slot.` },
      { name: 'author', content: 'The EOS Wall' },
      { name: 'keywords', content: 'EOS, wall, faq, why' }
    ]);
  }

}
