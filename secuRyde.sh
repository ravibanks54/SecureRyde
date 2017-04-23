#!/bin/bash
#SecuRyde bash script

spawn geth --testnet --verbosity 1 console
expect ">"

#connect to contract
send "eth.defaultAccount = eth.accounts\[1]"
send "personal.unlockAccount('0x705fbff76d76887a877333aae0627552013aa221',\"securyde\")\r"
expect ">"
send "var abi = \[{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ,{'name':'custLat','type':'string'} ,{'name':'custLong','type':'string'} ],'name':'confirmTrip','outputs':\[],'payable':true,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddress','type':'address'} ],'name':'returnPosition','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'withdrawFunds','outputs':\[{'name':'','type':'bool'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ,{'name':'destLat','type':'string'} ,{'name':'destLong','type':'string'} ],'name':'startRide','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ],'name':'finishRide','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ],'name':'confirmPayment','outputs':\[{'name':'','type':'uint256'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'checkLockStatus','outputs':\[{'name':'','type':'bool'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'newLat','type':'string'} ,{'name':'newLong','type':'string'} ],'name':'updatePosition','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'i','type':'uint256'} ],'name':'getLocationByIndex','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ,{'name':'','type':'address'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'initLat','type':'string'} ,{'name':'initLong','type':'string'} ],'name':'joinCarRegistry','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'getNumberOfCars','outputs':\[{'name':'','type':'uint256'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'returnDestination','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'returnRates','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ,{'name':'','type':'string'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ,{'name':'newLockState','type':'bool'} ],'name':'toggleLock','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'checkTripStatus','outputs':\[{'name':'','type':'uint8'} ],'payable':false,'type':'function'} ,{'inputs':\[],'payable':false,'type':'constructor'} ,{'anonymous':false,'inputs':\[{'indexed':false,'name':'tripCost','type':'uint256'} ,{'indexed':false,'name':'timeToArrival','type':'uint256'} ],'name':'TripQuoted','type':'event'} ];\r"
expect ">"
send "var MyContract = web3.eth.contract(abi);\r"
expect ">"
send "var contract = MyContract.at('0xdea37dc05f5732bafa747784620d1e2e3916240a');\r"
expect ">"

#continously check if car is called

while {true} {

	send "contract.checkTripStatus.call()\r"
	sleep 3
	expect {
		"0" {puts "trip status: 0"}
		"1" {break}
		"2" {puts "error: 2"}
		"3" {continue}
		timeout {puts "error: timeout"}
	}	
}

expect ">"
send "contract.returnPosition.call('0x705fbff76d76887a877333aae0627552013aa221')\r"
expect -re ".*"
puts "$expect_out(0,string)"

#locking/unlocking and starting ryde

while {true} {
	send "contract.checkLockStatus.call()\r"
	expect {
		"true" {spawn unlock.py}
		"false" {spawn lock.py}
		"timeout" {puts "unlock/lock timeout"}
	}
	expect ">"
	send "contract.checkTripStatus.call()\r"
	sleep 3
	expect {
		"1" {continue}
		"2" {break}
		"3" {puts "error: 3"}
		timeout {puts "error: timeout"}
	}	
}
expect ">"
puts "This Ryde has started!"
spawn lock.py

#locking/unlocking and ending ryde

while {true} {
	send "contract.checkLockStatus.call()\r"
	expect {
		"true" {spawn unlock.py}
		"false" {spawn lock.py}
		"timeout" {puts "unlock/lock timeout"}
	}
	
	expect ">"
	send "contract.checkTripStatus.call()\r"
	sleep 3
	expect {
		"1" {puts "error: 1"}
		"2" {continue}
		"3" {break}
		timeout {puts "error: timeout"}
	}	
}

puts "This Ryde has ended!"
spawn unlock.py