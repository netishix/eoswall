import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import ScatterJS from '@scatterjs/core';
// import ScatterEOS from '@scatterjs/eosjs'
// ScatterJS.plugins( new ScatterEOS() );
// import { Api } from 'eosjs';
import { ModalFormBuyComponent } from '../modal-form-buy/modal-form-buy.component';
import { ModalFormUpdateComponent } from '../modal-form-update/modal-form-update.component';
import { ModalNotificationComponent } from '../modal-notification/modal-notification.component';
import { Constants } from '../../constants';
import { Slot } from '../../lib/slot';
import Slots from '../../data/slots.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public Constants: any;
  public wall: {
    isLoading: boolean,
    slots: Slot[],
    pixelsSold?: number,
    pixelPrice?: number,
    isBuying: boolean,
    isUpdating: boolean,
  } = {
      isLoading: false,
      slots: [],
      isBuying: false,
      isUpdating: false,
    };

  // public scatter = ScatterJS.scatter;

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
      .finally(() => {
        this.wall.isLoading = false;
      });
  }

  public pullSlots(): Promise<boolean>{
    return new Promise((res) => {
      this.wall.slots = [];
      Slots.forEach((rawSlot) => {
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
      });
      this.wall.pixelsSold = 576900;
      this.wall.pixelPrice = Slot.calculatePixelPrice(this.wall.pixelsSold);
      res(true);
    });
  }

  public enableBuy() {
    this.wall.isBuying = true;
  }

  public disableBuy() {
    this.wall.isBuying = false;
  }

  public enableUpdate() {
    this.wall.isUpdating = true;
  }

  public disableUpdate() {
    this.wall.isUpdating = false;
  }

  public async openBuyModal(slot: Slot): Promise<any> {
    const connected = true; //await this.scatter.connect('EOS Wall');
    this.wall.isLoading = false;
    const modalSlotForm = this._NgbModal.open(ModalFormBuyComponent, {
      size: 'lg'
    });
    modalSlotForm.componentInstance.slot = slot;
    modalSlotForm.componentInstance.hasScatterInstalled = connected;
    return modalSlotForm.result;
  }

  public async openUpdateModal(slot: Slot): Promise<any> {
    const connected = true; //await this.scatter.connect('EOS Wall');
    const modalSlotForm = this._NgbModal.open(ModalFormUpdateComponent, {
      size: 'lg'
    });
    modalSlotForm.componentInstance.slot = slot;
    modalSlotForm.componentInstance.hasScatterInstalled = connected;
    return modalSlotForm.result;
  }

  public async openNotificationModal(settings: {type: string, title: string, description: string}): Promise<void> {
    const modalSuccess = this._NgbModal.open(ModalNotificationComponent, {
      size: 'lg'
    });
    modalSuccess.componentInstance.type = settings.type;
    modalSuccess.componentInstance.title = settings.title;
    modalSuccess.componentInstance.description = settings.description;
  }

  public async signBuyTransaction(slot: Slot) {
    // const requiredFields = {accounts: [Constants.network]}; // require an account that is connected to the network
    // await this.scatter.getIdentity(requiredFields);
    // const account = this.scatter.identity.accounts.find((x: any) => x.blockchain === Constants.network.blockchain);
    // const eosOptions = {expireInSeconds: 60};
    // const eos = this.scatter.eos(Constants.network, Api, eosOptions);
    // return eos.transaction({
    //   actions: [
    //     {
    //       account: 'eosio.token',
    //       name: 'transfer',
    //       authorization: [{
    //         actor: account.name,
    //         permission: account.authority
    //       }],
    //       data: {
    //         from: account.name,
    //         to: Constants.network.code,
    //         quantity: slot.price?.toString(),
    //         memo: 'Slot purchase - The EOS Wall'
    //       }
    //     },
    //     {
    //       account: Constants.network.code,
    //       name: 'buy',
    //       authorization: [{
    //         actor: account.name,
    //         permission: account.authority
    //       }],
    //       data: {
    //         x1: slot.c1[0],
    //         y1: slot.c1[1],
    //         x2: slot.c2[0],
    //         y2: slot.c2[1],
    //         title: slot.title,
    //         image: slot.image,
    //         url: slot.url,
    //         buyer: account.name
    //       }
    //     }
    //   ],
    // });
    return true;
  }

  public async signUpdateTransaction(slot: Slot) {
    // const requiredFields = { accounts: [Constants.network] }; // require an account that is connected to the network
    // await this.scatter.getIdentity(requiredFields)
    // const account = this.scatter.identity.accounts.find((x: any) => x.blockchain === Constants.network.blockchain);
    // const eosOptions = { expireInSeconds: 60 };
    // const eos = this.scatter.eos(Constants.network, Api, eosOptions);
    // const transactionOptions = { authorization: [`${account.name}@${account.authority}`] };
    // const contract = await eos.contract(Constants.network.code)
    // return contract.update({
    //   id: slot.id,
    //   title: slot.title,
    //   image: slot.image,
    //   url: slot.url,
    //   owner: slot.owner,
    // }, transactionOptions);
    return true;
  }

  public async onBuy(slot: Slot) {
    this.wall.isLoading = true;
    try {
      // Gather information about the slot
      const formValue = await this.openBuyModal(slot);
      slot.title = formValue.title;
      slot.image = formValue.image;
      slot.url = formValue.url;
      // refresh price
      await this.pullSlots();
      const updatedPrice = this.wall.pixelPrice as number;
      // set price
      slot.setPrice(updatedPrice);
      // sign transaction
      await this.signBuyTransaction(slot);
      // refresh slots
      await this.pullSlots();
      // show success notification
      await this.openNotificationModal({
        title: 'Great purchase!',
        description: 'The slot was assigned to your account',
        type: 'success'
      });
      this.disableBuy();
    } catch (e: any) {
      await this.openNotificationModal({
        title: 'Something went wrong',
        description: e,
        type: 'danger'
      });
    }
    this.wall.isLoading = false;
  }

  public async onUpdate(slot: Slot): Promise<void> {
    this.wall.isLoading = true;
    try {
      // Gather information about the slot
      const formValue = await this.openUpdateModal(slot);
      slot.title = formValue.title;
      slot.image = formValue.image;
      slot.url = formValue.url;
      slot.owner = formValue.owner;
      // sign transaction
      await this.signUpdateTransaction(slot);
      // refresh slots
      await this.pullSlots();
      // show success notification
      await this.openNotificationModal({
        title: 'All right!',
        description: 'The slot was updated successfully.',
        type: 'success'
      });
      this.disableUpdate();
    } catch (e: any) {
      await this.openNotificationModal({
        title: 'Something went wrong',
        description: e,
        type: 'danger'
      });
    }
    this.wall.isLoading = false;
  }
}
