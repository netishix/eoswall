import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import ScatterJS from 'scatter-js/dist/scatter.esm';
import Eos from 'eosjs';
import { ModalSlotFormComponent } from '../modal-slot-form/modal-slot-form.component';
import { ModalNotificationComponent } from '../modal-notification/modal-notification.component';
import { AuthService } from '../../services/auth.service';
import { Constants } from '../../constants';
import { Slot, SlotDescription } from '../../types';
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
    slots: Slot[]
    isBuying: boolean,
    isUpdating: boolean,
  } = {
      isLoading: false,
      slots: [],
      isBuying: false,
      isUpdating: false,
    };
  public isCheckingScatter: boolean;
  public hasScatterInstalled: boolean;

  constructor(public _NgbModal: NgbModal, public _AuthService: AuthService) { }

  ngOnInit() {
    this.Constants = Constants;
    this.pullSlots();
    this.isCheckingScatter = true;
    const scatter = ScatterJS.scatter;
    scatter.connect('EOS Wall')
      .then(connected => {
        this.hasScatterInstalled = connected;
      })
      .catch(() => { })
      .finally(() => {
        this.isCheckingScatter = false;
      });
  }

  public pullSlots() {
    this.wall.isLoading = true;
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
      rawSlots.forEach((rawSlot) => {
        const slot: Slot = {
          id: rawSlot.id,
          c1: [rawSlot.x1, rawSlot.y1],
          c2: [rawSlot.x2, rawSlot.y2],
          title: rawSlot.title,
          image: rawSlot.image,
          url: rawSlot.url,
          owner: rawSlot.owner
        };
        this.wall.slots.push(slot);
      });
    }).finally((response) => {
      this.wall.isLoading = false;
    });
  }

  public ownsSlots(account) {
    return this.wall.slots.filter(slot => slot.owner === account).length > 0;
  }

  public onBuy(slotDescription: SlotDescription) {
    const modalSlotForm = this._NgbModal.open(ModalSlotFormComponent, {
      size: 'lg'
    });
    modalSlotForm.componentInstance.buy = true;
    modalSlotForm.componentInstance.slotDescription = slotDescription;
    modalSlotForm.result
      .then((formValue) => {
        const account = this._AuthService.account;
        const eosOptions = { expireInSeconds: 60 };
        const eos = ScatterJS.scatter.eos(Constants.network, Eos, eosOptions);
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
              if (balance.amount >= slotDescription.price.amount) {
                // no need to deposit
                return null;
              } else {
                // calculate missing balance
                const missingAmount = (slotDescription.price.amount - balance.amount);
                debit = new Asset(missingAmount, Constants.network.symbol);
              }
            } else {
              debit = slotDescription.price;
            }
            return eos.transfer(account.name, Constants.network.code, debit.toString(),
            'Slot purchase - The EOS Wall', transactionOptions);
          })
          .then(() => eos.contract(Constants.network.code))
          .then((contract) => contract.buy({
            x1: slotDescription.c1[0],
            y1: slotDescription.c1[1],
            x2: slotDescription.c2[0],
            y2: slotDescription.c2[1],
            title: formValue.title,
            image: formValue.image,
            url: formValue.url,
            owner: account.name
          }, transactionOptions)
          )
          .then((r) => {
            const modalSuccess = this._NgbModal.open(ModalNotificationComponent, {
              size: 'lg'
            });
            modalSuccess.componentInstance.type = 'success';
            modalSuccess.componentInstance.title = 'Great purchase!';
            modalSuccess.componentInstance.description = 'The slot has been asigned to your account';
            this.wall.isBuying = false;
            this.pullSlots();
          })
          .catch(error => {
            // something went wrong with the transactions
            const modalError = this._NgbModal.open(ModalNotificationComponent, {
              size: 'lg'
            });
            modalError.componentInstance.type = 'danger';
            modalError.componentInstance.title = 'Oops! Something went wrong';
            modalError.componentInstance.description = `
            Check that you have enough tokens and your internet connection is working fine. Try again later`;
          });
      }).catch(error => {
        // could not get identity or modal was dismissed
      });
  }


  public onUpdate(data: {slot: Slot, slotDescription: SlotDescription}): void {
    const modalSlotForm = this._NgbModal.open(ModalSlotFormComponent, {
      size: 'lg'
    });
    modalSlotForm.componentInstance.buy = false;
    modalSlotForm.componentInstance.slot = data.slot;
    modalSlotForm.componentInstance.slotDescription = data.slotDescription;
    modalSlotForm.result
      .then((formValue) => {
        const account = this._AuthService.account;
        const eosOptions = { expireInSeconds: 60 };
        const eos = ScatterJS.scatter.eos(Constants.network, Eos, eosOptions);
        const transactionOptions = { authorization: [`${account.name}@${account.authority}`] };
        eos.contract(Constants.network.code)
          .then((contract) => contract.update({
            id: data.slot.id,
            title: formValue.title,
            image: formValue.image,
            url: formValue.url,
          }, transactionOptions)
          )
          .then((r) => {
            const modalSuccess = this._NgbModal.open(ModalNotificationComponent, {
              size: 'lg'
            });
            modalSuccess.componentInstance.type = 'success';
            modalSuccess.componentInstance.title = 'All right!';
            modalSuccess.componentInstance.description = 'The slot has been updated successfully';
            this.wall.isUpdating = false;
            this.pullSlots();
          })
          .catch(error => {
            // something went wrong with the transactions
            const modalError = this._NgbModal.open(ModalNotificationComponent, {
              size: 'lg'
            });
            modalError.componentInstance.type = 'danger';
            modalError.componentInstance.title = 'Oops! Something went wrong';
            modalError.componentInstance.description = 'Please check you have enough ram to update the slot';
          });
      }).catch(error => {
        // could not get identity or modal was dismissed
      });
  }
}
