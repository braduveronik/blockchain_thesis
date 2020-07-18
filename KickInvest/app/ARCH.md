# Contract architecture

## Description
### Governor
	- allows creating new Projects
	- stores Projects in a list
	- can be queried, returns list of all existing prjects
	- self destruct, deletes everything (cleanup / evading the law)

### Project
	- allows anybody to invest (transfer founds in the contract's account), making him / her an investor
	- allows the owner to initiate (create) a Transaction / Transfer
	- self destruct (returns the money back to investors) - by % of ownership / by full refund in the order of ownership size?
	
### Transaction / Transfer
	- allows investors to vote
	- completes the transaction / transfer (by transfering the funds to the recipient) if one of the following conditions is met:
		- 51+% of investors are in favour of the transaction / transfer
		- the transfer / transaction expires, and the majority of the cast votes are in favour.
	- cancels the transaction / transfer (by trasnfering the funds back to the Project account) if:
		- 51+% of investors are against.
		- the votes are split 50-50 even
		- the transfer / transaction expires, and the majority of the cast votes are against.
		- the transfer / transaction expires, and there are no cast votes.
		
	- self destruct (can be called anytime by the creator / project owner, transfers back the project funds)
	
## Implementation
### Governor
|Method|Access|Description|
|:---:|:---:|---|
|`create_project()`|public|create a new Project|
|`get_projects()`|public|returns list of all existing prjects|
|`explode()`|owner|self destruct|
	
### Project
|Method|Access|Description|
|:---:|:---:|---|
|`invest()`|investors|invest in this venture|
|`bail()`|investors|bail out of the investment. <sup>1</sup>|
|`init_transaction()`|owner|Initialize a new Transaction / transfer <sup>2</sup>|
|`explode()`|owner|self destruct the project. More info above.|

1. Maybe you should not implement this. Investments must have a degree of risk. Yes, even manufactured, artificial risk.
2. * Once a transaction is initialized, the value of it is auto-transfered to an `escrow` account (the Transaction's account) and will be held until a resolution is achieved. More info above.
	* The investors list at the moment of the transaction creation will be transfered, so any new investors that come after this moment will not be able to cast a vote for this. (In theory, his money is fresh, and was not in the original pot - this should aid in avoiding any shenanigans by investors)
	
### Transaction / Transfer :-/
|Method|Access|Description|
|:---:|:---:|---|
|`vote()`|investors|cast a vote pro or con vote (or should it be aye() or nay()??). Futhermore, checks the conditions, and if met, completes or cancels the transaction|
|`explode()`|owner|get the funds back (cancel the transfer anytime), or get the funds back if it expires, and it did not meet the vote conditions - this should be auto-performed by the client|
									
