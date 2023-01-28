# The EOS Wall

## ¿What is The EOS Wall?

The EOS Wall project was born as a proof of concept of EOS DAPP.
Every user that has an EOS account can buy a portion of the wall called
**slot** A slot is composed by a title, an image and an url to redirect when the slot is clicked.
All the slots are stored in the EOS blockchain and can be updated at anytime by its owners.

## ¿How is the price calculated?

The price of a slot is calculated with the following formula:

__Slot price = Pixel price x Slot pixels__

The pixel price will change over time automatically depending on the total pixels that had been sold. It is calculated with the following lineal
functions:

When, sold pixels <= 800,000 pixels, then:

__Pixel price = 0.0015 EOS / 1,000,000 pixels x Pixels sold + 0.0005 EOS__

When, sold pixels > 800,000 pixels, then:

__Pixel price</span> = 0.003 EOS / 1,000,000 pixels x Pixels sold + 0.0005 EOS__

## ¿Who pays for RAM?

The RAM for every new slot stored in the wall is payed by the smart contract itself.

## ¿Can I trust the external links?

No, you can't. This app is not responsible for the content of external sites referenced by the slots.
However, we make our best to constantly moderate the slots. Any slot considered malicious will be removed from the wall.

## ¿Where can I find the smart contract?

The smart contract has the following structure. For more information please refer to the Ricardian Contracts
attached to the smart contract.

### Contract: __eosisrocking__

### Tables:  
* __slot__ (eosisrocking scope)
* __account__ (account scope)

### Public actions:
* __buy__
* __update__

## ¿Why do I need Scatter to buy a slot?

To buy or update a slot, it is necessary to interact with the EOS blockchain. Scatter extension has the ability to interact with the blockchain by pushing and signing transactions safely using your browser.
