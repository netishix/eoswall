import { Component, OnInit } from '@angular/core';
import {  Title, Meta } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import ScatterJS from 'scatter-js/dist/scatter.esm';
import Eos from 'eosjs';
import { ModalFormBuyComponent } from '../modal-form-buy/modal-form-buy.component';
import { ModalFormUpdateComponent } from '../modal-form-update/modal-form-update.component';
import { ModalNotificationComponent } from '../modal-notification/modal-notification.component';
import { Constants } from '../../constants';
import { Slot } from '../../lib/slot';
import { Asset } from '../../lib/asset';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public Constants;
  public wall: {
    isLoading: boolean,
    slots: Slot[],
    pixelsSold: number,
    pixelPrice: number,
    isBuying: boolean,
    isUpdating: boolean,
  } = {
      isLoading: false,
      slots: [],
      pixelsSold: null,
      pixelPrice: null,
      isBuying: false,
      isUpdating: false,
    };

  constructor(public _Title: Title, public _Meta: Meta, public _NgbModal: NgbModal) { }

  ngOnInit() {
    this._Title.setTitle('Own a SLOT. Own a piece of History - The EOS Wall');
    this._Meta.addTags([
      {
        name: 'description', content: `The EOS Wall project was born as a proof of concept of EOSIO DAPP.
      Every user that has an EOSIO account can buy a portion of the wall called slot.` },
      { name: 'author', content: 'The EOS Wall' },
      { name: 'keywords', content: 'EOS, wall, slot, buy, blockchain, dapp, proof of concept, scatter, million dollar homepage' }
    ]);
    this.Constants = Constants;
    this.wall.isLoading = true;
    this.pullSlots()
      .finally((response) => {
        this.wall.isLoading = false;
      });
  }

  public pullSlots() {
    this.wall.slots = [];
    const eos = Eos({
      httpEndpoint: `${Constants.network.protocol}://${Constants.network.host}:${Constants.network.port}`,
      chainId: Constants.network.chainId
    });
    return eos.getTableRows({
      code: Constants.network.code,
      scope: Constants.network.code,
      table: 'slot',
      json: true,
      limit: 0
    }).then((response) => {
      const rawSlots = response.rows;
      let time = 1000;
      this.wall.pixelsSold = 0;
      rawSlots.forEach((rawSlot) => {
        time += 100;
        setTimeout(() => {
          const slot = new Slot({
            id: rawSlot.id,
            c1: [rawSlot.x1, rawSlot.y1],
            c2: [rawSlot.x2, rawSlot.y2],
            title: rawSlot.title,
            image: rawSlot.image,
            url: rawSlot.url,
            owner: rawSlot.owner
          });
          this.wall.slots.push(slot);
          this.wall.pixelsSold += slot.pixels;
          const wallPixels = Constants.wall.wallWidth * Constants.wall.wallHeight;
          const slope = (this.wall.pixelsSold <= 800000) ? (0.0015 / wallPixels) : (0.003 / wallPixels);
          this.wall.pixelPrice = (slope * this.wall.pixelsSold) + 0.0005;
        }, time);
      });
    });
  }

  public onBuy(slot: Slot) {
    this.wall.isLoading = true;
    const scatter = ScatterJS.scatter;
    scatter.connect('EOS Wall')
      .then(connected => {
        this.wall.isLoading = false;
        const modalSlotForm = this._NgbModal.open(ModalFormBuyComponent, {
          size: 'lg'
        });
        modalSlotForm.componentInstance.slot = slot;
        modalSlotForm.componentInstance.hasScatterInstalled = connected;
        return modalSlotForm.result;
      })
      .then((formValue) => {
        this.wall.isLoading = true;
        const requiredFields = { accounts: [Constants.network] }; // require an account that is connected to the network
        scatter.getIdentity(requiredFields)
          .then(() => {
            const account = scatter.identity.accounts.find(x => x.blockchain === Constants.network.blockchain);
            const eosOptions = { expireInSeconds: 60 };
            const eos = scatter.eos(Constants.network, Eos, eosOptions);
            const transactionOptions = { authorization: [`${account.name}@${account.authority}`] };
            eos.getTableRows({
              code: Constants.network.code,
              scope: account.name,
              table: 'account',
              json: true,
              limit: 0
            })
              .then((response) => {
                let debit: Asset;
                if (response.rows.length > 0) {
                  const balance = Asset.fromString(response.rows[0].balance);
                  if (balance.amount >= slot.price.amount) {
                    // no need to deposit
                    return null;
                  } else {
                    // calculate missing balance
                    const missingAmount = (slot.price.amount - balance.amount);
                    if (missingAmount >= 0) {
                      debit = new Asset(missingAmount, Constants.network.symbol);
                    } else {
                      return null;
                    }
                  }
                } else {
                  debit = slot.price;
                }
                return eos.transfer(account.name, Constants.network.code, debit.toString(),
                  'Slot purchase - The EOS Wall', transactionOptions);
              })
              .then(() => eos.contract(Constants.network.code))
              .then((contract) => contract.buy({
                x1: slot.c1[0],
                y1: slot.c1[1],
                x2: slot.c2[0],
                y2: slot.c2[1],
                title: formValue.title,
                image: formValue.image,
                url: formValue.url,
                buyer: account.name
              }, transactionOptions))
              .then((r) => this.pullSlots())
              .then(() => {
                const modalSuccess = this._NgbModal.open(ModalNotificationComponent, {
                  size: 'lg'
                });
                modalSuccess.componentInstance.type = 'success';
                modalSuccess.componentInstance.title = 'Great purchase!';
                modalSuccess.componentInstance.description = 'The slot was assigned to your account';
                this.wall.isBuying = false;
              })
              .catch(error => {
                console.log(error);
                // something went wrong with the transactions
                const modalError = this._NgbModal.open(ModalNotificationComponent, {
                  size: 'lg'
                });
                modalError.componentInstance.type = 'danger';
                modalError.componentInstance.title = 'Oops! Something went wrong';
                modalError.componentInstance.description = `Check that you have enough resources to buy the slot and try again.`;
              })
              .finally((response) => {
                this.wall.isLoading = false;
              });
          })
          .catch(error => {
            // could not get identity
            this.wall.isLoading = false;
          });
      }).catch(error => {
        // modal was dismissed
      });
  }


  public onUpdate(slot: Slot): void {
    this.wall.isLoading = true;
    const scatter = ScatterJS.scatter;
    scatter.connect('EOS Wall')
      .then(connected => {
        this.wall.isLoading = false;
        const modalSlotForm = this._NgbModal.open(ModalFormUpdateComponent, {
          size: 'lg'
        });
        modalSlotForm.componentInstance.slot = slot;
        modalSlotForm.componentInstance.hasScatterInstalled = connected;
        return modalSlotForm.result;
      })
      .then((formValue) => {
        this.wall.isLoading = true;
        const requiredFields = { accounts: [Constants.network] }; // require an account that is connected to the network
        scatter.getIdentity(requiredFields)
          .then(() => {
            const account = scatter.identity.accounts.find(x => x.blockchain === Constants.network.blockchain);
            const eosOptions = { expireInSeconds: 60 };
            const eos = scatter.eos(Constants.network, Eos, eosOptions);
            const transactionOptions = { authorization: [`${account.name}@${account.authority}`] };
            eos.contract(Constants.network.code)
              .then((contract) => contract.update({
                id: slot.id,
                title: formValue.title,
                image: formValue.image,
                url: formValue.url,
                owner: formValue.owner,
              }, transactionOptions))
              .then((r) => this.pullSlots())
              .then(() => {
                const modalSuccess = this._NgbModal.open(ModalNotificationComponent, {
                  size: 'lg'
                });
                modalSuccess.componentInstance.type = 'success';
                modalSuccess.componentInstance.title = 'All right!';
                modalSuccess.componentInstance.description = 'The slot was updated successfully';
                this.wall.isUpdating = false;
              })
              .catch(error => {
                // something went wrong with the transactions
                const modalError = this._NgbModal.open(ModalNotificationComponent, {
                  size: 'lg'
                });
                modalError.componentInstance.type = 'danger';
                modalError.componentInstance.title = 'Oops! Something went wrong';
                modalError.componentInstance.description = 'Check that you are the owner of the slot and that you have enough resources.';
              })
              .finally((response) => {
                this.wall.isLoading = false;
              });
          })
          .catch(error => {
            // could not get identity
            this.wall.isLoading = false;
          });
      }).catch(error => {
        // modal was dismissed
      });
  }
}
