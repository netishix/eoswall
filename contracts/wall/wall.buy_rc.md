# CONTRACT FOR wall::buy

## ACTION NAME: buy

### Parameters
Input parameters:

* `x1` (coordinate x1 of the requested slot. Integer [0 to 1000])
* `y1` (coordinate y1 of the requested slot. Integer [0 to 1000])
* `x2` (coordinate x2 of the requested slot. Integer [0 to 1000])
* `y2` (coordinate y2 of the requested slot. Integer [0 to 1000])
* `title` (title to display when mouse is over the slot. String [0 - 60])
* `image` (url of image to display inside the slot. String [0 - 300])
* `url` (url to redirect when a click is made on the slot. String [0 - 300])
* `owner` (account of that will own the slot)

### Intent
INTENT. The intent of the {{ buy }} action is to buy a slot of the requested coordinates inside the wall.

### Term
TERM. In order to buy the slot the user must have tokens in the wall account and the slot must be available. Ram fee is payed by the contract.
