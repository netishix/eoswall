# CONTRACT FOR wall::update

## ACTION NAME: update

### Parameters
Input parameters:

* `id` (id of the requested slot)
* `title` (title to display when mouse is over the slot. String [0 - 60])
* `image` (url of image to display inside the slot. String [0 - 300])
* `url` (url to redirect when a click is made on the slot. String [0 - 300])

### Intent
INTENT. The intent of the {{ update }} action is to update the title, image and url of a slot.

### Term
TERM. In order to update the slot data, the user must own the slot or be the owner of the contract. Ram fee is payed by the contract.
