pragma solidity ^0.4.8;

contract CarRegistry {

    mapping(address => Position) carDatabase;   //Maps car addresses to their GPS coordinates
    //mapping(address => uint) costs;     //Maps user addresses to amount they owe
    mapping(address => uint) escrow;    //Maps car addresses to amount they are owed
    mapping(address => TripPosition) trips; //Maps car addresses to client's current location and destination
    address[] registeredCars;

    string baseRate;
    string dollarsPerMile;
    string dollarsPerMinute;

    event TripQuoted(uint tripCost, uint timeToArrival);
    /* Constructor */
    function CarRegistry(){
        registeredCars[registeredCars.length++] = 0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20;
        registeredCars[registeredCars.length++] = 0xb063c23249bd719b4e5217b507570724ccbdbff1;
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].lat = "40.4317";
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].long = "-74.4050";
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].isValid = true;
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].lat = "40.594";
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].long = "-74.6049";
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].isValid = true;
        baseRate = "1.05";
        dollarsPerMile = "1.15";
        dollarsPerMinute = "0.153";

    }
    
    struct Position {
		string lat;
		string long;
        bool isValid;
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

    struct TripPosition {
        address client;
        Position clientPos;
        Position destPos;
        bool isUnlocked;
        uint tripStatus; //1 -> Trip Pending, 2 -> Trip In Progress, 3 -> Trip Finished
    }

    function confirmTrip(address carAddr, string custLat, string custLong, string destLat, string destLong) payable public {
        if (msg.value == 0){
            throw;
        }

        escrow[carAddr] = msg.value;
        trips[carAddr].client = msg.sender;
        trips[carAddr].isUnlocked = false;
        trips[carAddr].clientPos = Position(custLat, custLong, true);
        trips[carAddr].destPos = Position(destLat, destLong, true);
        trips[carAddr].tripStatus = 1;  //Trip Pending
    }

    function startRide(address carAddr) public {
        if (trips[carAddr].client == msg.sender){
            trips[carAddr].tripStatus = 2;  //Trip in Progress
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


    /*
    function requestTripQuote(string clientLat, string clientLong, string destinationLat, string destinationLong) public {    //Returns payment cost and arrival estimate
        if (msg.value > 0) throw;
        address carAddr;
        for(uint i = 0; i <= numCars; i++){
            carAddr = carDatabase[registeredCars[0]]; //Figure out closest car address
            //calculate cost based on distance
            break;
        }
        uint cost = 100000;
        TripQuoted(cost, 200000);
        costs[msg.sender] = cost;
        Position clientPos = new Position(clientLat, clientLong);
        Position destPos = new Position(destinationLat, destinationLong);
        TripPosition positions = new TripPosition(clientPos, destPos, false);
        trips[carAddr] = positions;


        //Create event here with trip quote and time to arrival
        //Perhaps timestamp quote to only be valid for a short time
        //Edge case: no longer valid quote
        //Set cost in costs mapping
            
    }

    function confirmTrip() payable public returns () {
        if (msg.value == costs[msg.sender]){
            escrow[carAddr] = msg.value;
            trips[carAddr].confirmed = true;    //Once Trip is finished, clear this
        }else{
            throw;
        }
    }

    function hasCustomer() public returns (bool){
        return trips[msg.sender].confirmed == true;
    }

    function reachedDestination() public{
        trips[msg.sender] = 0;
        
    }

    function withdraw() public {
        if (escrow[msg.sender] != 0){
            if (!msg.sender.send(escrow[msg.sender])){
                return false;
            }else{
                return true;
            }
        }else{
            throw;
        }
    }
*/
}

