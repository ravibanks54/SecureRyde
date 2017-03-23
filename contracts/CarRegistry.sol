pragma solidity ^0.4.8;

contract CarRegistry {

    mapping(address => Position) carDatabase;   //Maps car addresses to their GPS coordinates
    mapping(address => uint) costs;     //Maps user addresses to amount they owe
    mapping(address => uint) escrow;    //Maps car addresses to amount they are owed
    mapping(address => TripPosition) customers; //Maps car addresses to client's current location
    address[] registeredCars;

    event TripQuoted(uint tripCost, uint timeToArrival);
    /* Constructor */
    function CarRegistry(){
        registeredCars[0] = 0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20;
        registeredCars[1] = 0xb063c23249bd719b4e5217b507570724ccbdbff1;
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].lat = "40.4317";
        carDatabase[0x6c68d25601e3b02fd2b22bb287bdbf5ec85c9b20].long = "-74.4050";
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].lat = "40.594";
        carDatabase[0xb063c23249bd719b4e5217b507570724ccbdbff1].long = "-74.6049";
    }
    
    struct Position {
		string lat;
		string long;
	}

    function returnPosition(address carAddress) public returns (string){
        //return (carDatabase[carAddress].lat, carDatabase[carAddress].long);
        return (carDatabase[carAddress].lat);

    }

    struct TripPosition {
        Position clientPos;
        Position destPos;
        bool confirmed;
    }
/*
    function joinCarRegistry(string initLat, string initLong) public {
    	if (msg.value > 0) throw;
    	if (carDatabase[msg.sender] == 0){		//Check if no entry exists
    		carDatabase[msg.sender].lat = lat;
            carDatabase[msg.sender].long = long;
            registeredCars.length++;
            registeredCars[registeredCars.length - 1] = msg.sender;
    	}else{
    		throw;
    	}
    }


    function updatePosition(string newLat, string newLong) public {
        if (msg.value > 0) throw;
    	if (carDatabase[msg.sender] != 0){
    		carDatabase[msg.sender].lat = newLat;
            carDatabase[msg.sender].long = newLong;
    	}else{
            throw;
        }
    }
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
        customers[carAddr] = positions;


        //Create event here with trip quote and time to arrival
        //Perhaps timestamp quote to only be valid for a short time
        //Edge case: no longer valid quote
        //Set cost in costs mapping
            
    }

    function confirmTrip() payable public returns () {
        if (msg.value == costs[msg.sender]){
            escrow[carAddr] = msg.value;
            customers[carAddr].confirmed = true;    //Once Trip is finished, clear this
        }else{
            throw;
        }
    }

    function hasCustomer() public returns (bool){
        return customers[msg.sender].confirmed == true;
    }

    function reachedDestination() public{
        customers[msg.sender] = 0;
        
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
