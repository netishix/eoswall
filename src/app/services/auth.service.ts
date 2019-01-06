import { Injectable } from '@angular/core';
import ScatterJS from 'scatterjs-core';
import { Constants } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public account: any;

  constructor() { }

  public isLoggedIn() {
    return this.account;
  }

  public login(account): void {
    const scatter = ScatterJS.scatter;
    scatter.connect('EOS Wall')
    .then(connected => {
      const requiredFields = { accounts: [Constants.network] }; // require an account that is connected to the network
      return scatter.getIdentity(requiredFields);
    })
    .then(() => {
      this.account = scatter.identity.accounts.find(x => x.blockchain === Constants.network.blockchain);
    })
    .catch((error) => {
      this.account = null;
    });
  }

  public logout(): void {
    const scatter = ScatterJS.scatter;
    scatter.forgetIdentity();
    this.account = null;
  }
}

