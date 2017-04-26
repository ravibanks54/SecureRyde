pragma solidity ^0.4.8;

contract CarRegistry {

    mapping(address => Position) carDatabase;   //Maps car addresses to their GPS coordinates
    mapping(address => uint) escrow;    //Maps car addresses to amount they are owed
    mapping(address => TripPosition) trips; //Maps car addresses to client's current location and destination
    address[] registeredCars;

    string baseRate;
    string dollarsPerMile;
    string dollarsPerMinute;

    address initAddr;
    /*
    "0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20", "40.4317", "-74.4050", "40.594", "-74.6049"
    */
    event TripStatusUpdate(address carAddr, string TripStatus);
    /* Constructor */
    function CarRegistry(){


        initAddr = 0xf0d271e17d629565130d367fae122e5c55107baf;
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
        uint tripStatus; //1 -> Trip Pending, 2 -> Trip In Progress, 3 -> Trip Finished
    }


    function returnPosition(address carAddress) public returns (string, string){
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
        escrow[carAddr] = escrow[carAddr] + msg.value;
        //trips[carAddr] = TripPosition(msg.sender, custLat, custLong, false, 1);
        trips[carAddr].client = msg.sender;  
        trips[carAddr].lat = custLat;
        trips[carAddr].long = custLong;
        trips[carAddr].tripStatus = 1111; //Trip Pending
        trips[carAddr].isUnlocked = false;
        TripStatusUpdate(carAddr, "Trip confirmed.");
    }

    function startRide(address carAddr, string destLat, string destLong) public {
        if (trips[carAddr].client == msg.sender){
            trips[carAddr].tripStatus = 2222;  //Trip in Progress
            trips[carAddr].lat = destLat;
            trips[carAddr].long = destLong;
            TripStatusUpdate(carAddr, "Trip in progress.");
        }
    }

    function finishRide(address carAddr) public {
        if (trips[carAddr].client == msg.sender){
            trips[carAddr].tripStatus = 3333;  //Trip Finished
            trips[carAddr].isUnlocked = false;
            TripStatusUpdate(carAddr, "Trip finished.");

        }
    }


    function confirmPayment(address carAddr) public returns (uint) {
        return escrow[carAddr];
    }


    function toggleLock(address carAddr, bool newLockState) public {    //True unlocks, false locks
        if (trips[carAddr].tripStatus == 2222 && trips[carAddr].client == msg.sender){
            if (trips[carAddr].isUnlocked != newLockState){
                trips[carAddr].isUnlocked = newLockState;
                if (newLockState == true){
                        TripStatusUpdate(carAddr, "Unlocking...");
                    }else{
                        TripStatusUpdate(carAddr, "Locking...");

                    }
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

    function checkTripStatus() public returns (uint){
        return trips[msg.sender].tripStatus;
    }

    function checkLockStatus() public returns (bool){
        return trips[msg.sender].isUnlocked;
    }

    function returnDestination() public returns (string, string){
        return (trips[msg.sender].lat, trips[msg.sender].long);
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

