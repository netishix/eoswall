# The EOS Wall

URL: https://eos-wall.onrender.com/

## Introduction

The EOS Wall project was born as a proof of concept of EOS DAPP.
Every user that has an EOS account can buy a portion of the wall called
**slot**. A slot is composed by a title, an image and an url to redirect when the slot is clicked.
All the slots are stored in the EOS blockchain and can be updated at anytime by its owners.


## Price Calculation

The price of a slot is calculated with the following formula:

```Slot price = Pixel price x Slot pixels```

The pixel price will change over time automatically depending on the total pixels that had been sold. It is calculated with the following lineal
functions:

When, sold pixels <= 800,000 pixels, then:

```Pixel price = 0.0015 EOS / 1,000,000 pixels x Pixels sold + 0.0005 EOS```

When, sold pixels > 800,000 pixels, then:

```Pixel price = 0.003 EOS / 1,000,000 pixels x Pixels sold + 0.0005 EOS```


## RAM Cost

The RAM for every new slot stored in the wall is payed by the smart contract itself.


## Trusting External Sites

Trust external sites at your own risk. This app is not responsible for the content of external sites referenced by the slots.
However, we make our best to constantly moderate the slots. Any slot considered malicious will be removed from the wall.


## Smart Contract

The smart contract has the following structure. For more information please refer to the Ricardian Contracts
attached to the smart contract.

```
Contract: eosisrocking

Tables: 
 -> slot (eosisrocking scope)
 -> account (account scope)
 
Public Actions:
 -> buy
 -> update
```

## Signing Transactions

To buy or update a slot, it is necessary to interact with the EOS blockchain. Scatter extension has the ability to interact with the blockchain by pushing and signing transactions safely using your browser.
