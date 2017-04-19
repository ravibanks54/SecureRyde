pragma solidity ^0.4.8;

contract CarRegistry {

    mapping(address => Position) carDatabase;   //Maps car addresses to their GPS coordinates
    mapping(address => uint) escrow;    //Maps car addresses to amount they are owed
    mapping(address => TripPosition) trips; //Maps car addresses to client's current location and destination
    address[] registeredCars;

    string baseRate;
    string dollarsPerMile;
    string dollarsPerMinute;

    address initAddress;
    /*
    "0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20", "40.4317", "-74.4050", "40.594", "-74.6049"
    */
    event TripQuoted(uint tripCost, uint timeToArrival);
    /* Constructor */
    function CarRegistry(){
        /*registeredCars[registeredCars.length++] = 0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20;
        registeredCars[registeredCars.length++] = 0xb063c23249bd719b4e5217b507570724ccbdbff1;
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].lat = "40.4317";
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].long = "-74.4050";
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].isValid = true;
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].lat = "40.594";
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].long = "-74.6049";
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].isValid = true;
        */

        initAddr = 0xb063c23249bd719b4e5217b507570724ccbdbff1;
        registeredCars[registeredCars.length++] = initAddr;
        carDatabase[initAddr].lat = "40.4317";
        carDatabase[initAddr].long = "-74.4050";
        carDatabase[initAddr].isValid = true;

        baseRate = "1.05";
        dollarsPerMile = "1.15";
        dollarsPerMinute = "0.153";

    }
    
    struct Position {
		string lat;
		string long;
        bool isValid;
	}

    struct TripPosition {
        address client;
        string lat;
        string long;
        bool isUnlocked;
        uint8 tripStatus; //1 -> Trip Pending, 2 -> Trip In Progress, 3 -> Trip Finished
    }


    function returnPosition(address carAddress) public returns (string, string){
        //return (carDatabase[carAddress].lat, carDatabase[carAddress].long);
        return (carDatabase[carAddress].lat, carDatabase[carAddress].long);
    }

    function getLocationByIndex(uint i) public returns (string, string, address){
        if (i >= registeredCars.length){
            throw;
        }
        return (carDatabase[registeredCars[i]].lat, carDatabase[registeredCars[i]].long, registeredCars[i]);
    }

    function getNumberOfCars() public returns (uint){
        return registeredCars.length;
    }

    function returnRates() public returns (string, string, string){
        return (baseRate, dollarsPerMinute, dollarsPerMile);
    }


    function confirmTrip(address carAddr, string custLat, string custLong) payable public {
        if (msg.value == 0){
            throw;
        }
        escrow[carAddr] = msg.value;
        //trips[carAddr] = TripPosition(msg.sender, custLat, custLong, false, 1);
        trips[carAddr].client = msg.sender;  
        trips[carAddr].lat = custLat;
        trips[carAddr].long = custLong;
        trips[carAddr].tripStatus = 1; //Trip Pending
    }

    function startRide(address carAddr, string destLat, string destLong) public {
        if (trips[carAddr].client == msg.sender){
            trips[carAddr].tripStatus = 2;  //Trip in Progress
            trips[carAddr].lat = destLat;
            trips[carAddr].long = destLong;

        }
    }

    function finishRide(address carAddr) public {
        if (trips[carAddr].client == msg.sender){
            trips[carAddr].tripStatus = 3;  //Trip Finished
        }
    }


    function confirmPayment(address carAddr) public returns (uint) {
        return escrow[carAddr];
    }


    function toggleLock(address carAddr, bool newLockState) public {    //True unlocks, false locks
        if (trips[carAddr].tripStatus == 2 && trips[carAddr].client == msg.sender){
            if (trips[carAddr].isUnlocked != newLockState){
                trips[carAddr].isUnlocked = newLockState;
            }
        }
    }

//Car Functions:

    function joinCarRegistry(string initLat, string initLong) public {
        if (carDatabase[msg.sender].isValid != false){    //If it already exists, throw
            throw;
        }else{
        	carDatabase[msg.sender].lat = initLat;
            carDatabase[msg.sender].long = initLong;
            carDatabase[msg.sender].isValid = true;
            registeredCars[registeredCars.length++] = msg.sender;
        }
    }


    function updatePosition(string newLat, string newLong) public {
    	if (carDatabase[msg.sender].isValid != false){   //If it does exist, continue
    		carDatabase[msg.sender].lat = newLat;
            carDatabase[msg.sender].long = newLong;
    	}else{
            throw;
        }
    }

    function checkTripStatus() public returns (uint8){
        return trips[msg.sender].tripStatus;
    }

    function checkLockStatus() public returns (bool){
        return trips[msg.sender].isUnlocked;
    }

    function withdrawFunds() public returns (bool){
        uint amount = escrow[msg.sender];
        // Zero the pending refund before
        // sending to prevent re-entrancy attacks
        escrow[msg.sender] = 0;
        if (msg.sender.send(amount)) {
            return true;
        } else {
            escrow[msg.sender] = amount;
            return false;
        }
    }

}

