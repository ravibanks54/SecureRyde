// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

//ssh pi@172.31.170.172

// Import our contract artifacts and turn them into usable abstractions.
import carregistry_artifacts from '../../build/contracts/CarRegistry.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var CarRegistry = contract(carregistry_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var map;
var destination;
var userRequested = 0;
var pos;
var userLoc;
var directionsDisplay;
var directionsService;
var carLocations = [];
var carEthAddresses = [];
var bestTotalDuration = 0;
var nearestCar = 0;
var distances = [];
var carDirectionsDisplay;
var carDirectionsService;
var globalCostInEth;
var originialPosition;

window.App = {
	start: function() {
		var self = this;
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsService = new google.maps.DirectionsService();
		carDirectionsDisplay = new google.maps.DirectionsRenderer();
		carDirectionsService = new google.maps.DirectionsService();
	 //self.initMap();

	 // Bootstrap the MetaCoin abstraction for Use.
	 CarRegistry.setProvider(web3.currentProvider);

	 // Get the initial account balance so it can be displayed.
	 web3.eth.getAccounts(function(err, accs) {
	 	if (err != null) {
	 		alert("There was an error fetching your accounts.");
	 		return;
	 	}

	 	if (accs.length == 0) {
	 		alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
	 		return;
	 	}

	 	accounts = accs;
	 	account = accounts[0]; 
	 	var balance = web3.fromWei(web3.eth.getBalance(accs[2]), "ether")
	 	self.setElement(balance, 'balance');


	 	self.initializeCarRegistry();
	 });
	},

	setStatus: function(message) {
		var status = document.getElementById("status");
		status.innerHTML = message;
	},

	setElement: function(message, id) {
		var element = document.getElementById(id);
		element.innerHTML = message;
	},

	initializeCarRegistry: function() {
		var self = this;

		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			return self.checkCarLocations();
		});
	},

	checkCarLocations: function() {
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			//self.setStatus("Loading");
			return register.getNumberOfCars.call({from: account});
		}).then(function(num){
			console.log(num);
			var posArr = [];
			for (var i = 0; i < num; i++) {
				var posCar = register.getLocationByIndex.call(i, {from: account});
				console.log(posCar);
				posArr.push(posCar);
			}
			return Promise.all(posArr);
		}).then(function(array){
			var carNumber = 0;
			for (var i = array.length - 1; i >= 0; i--) {
				carLocations[carNumber] = appendMarker(map, parseFloat(array[i][0]), parseFloat(array[i][1]), "car");
				carEthAddresses[carNumber] = array[i][2];
				self.calcTime(carLocations[carNumber].position, carNumber, distances);
				carNumber++;	
			}
			return array;
		}).then(function(value) {
			//self.setStatus(value);
		}).catch(function(e) {
			console.log(e);
			//self.setStatus("error");
		});
	},

	findNearestCar: function(){
		var self = this;
		var mintime = -1;
		var carNumber = 0;
		var curTime = 0;

		for (var k = 0; k < distances.length; k++){
			curTime = distances[k];
		  	/*var pos1 = pos;
		  	var pos2 = carLocations[k].position;
		  	self.calcTime(pos1, pos2);
		  	curTime = bestTotalDuration;
		  	console.log("We are looking at a different car now:");
		  	console.log("Here is the position of the car: " + pos2);
		  	console.log("The time for this car: " + curTime);
		  	console.log("bestTotalDuration: " + bestTotalDuration);*/
		  	if (mintime == -1){
		  		mintime = curTime;
		  		carNumber = k;
		  	}else {
		  		if(mintime > curTime){
		  			carLocations[carNumber].setMap(null);
		  			mintime = curTime;
		  			carNumber = k;

		  		}else{
		  			carLocations[k].setMap(null);
		  		}
		  	}
		  }
		  nearestCar = carNumber;

		},

		calcTime: function(pos1, carNumber, distances){
			var self = this;
			var pos2 = pos;

			if(typeof pos2 == 'undefined'){
				//set default location
				console.log("POS2 BEING SET");
				pos2 = {lat: 40.521803, lng: -74.460833};
			}
			console.log("Pos1: " + pos1);
			console.log("Pos2: " + pos2);
			var request = {
				origin: pos1,
				destination: pos2,
				travelMode: 'DRIVING'
			};

			carDirectionsService.route(request, function(result, status) {
				if (status == 'OK') {
				//		console.log("Your directions are being rendered");
				var totalDuration = 0;
				carDirectionsDisplay.setDirections(result);

				var legs = result.routes[0].legs;
				var totalDuration = 0;
				for(var i=0; i<legs.length; ++i) {
					totalDuration += legs[i].duration.value;
				}
				console.log("totalDuration: " + totalDuration/60);
				totalDuration = Math.ceil(totalDuration / 60);
				//self.setElement("you cannot afford this", 'costEstimate');
				console.log("We are now in CALCTIME!!!");
				console.log("calculated duration for "+ pos1 +": " + totalDuration);
				distances[carNumber] = totalDuration;
			}else{
				console.log("Problem with calculating time of cars");
			}
		});

		},
		confirmRide: function(){
			var self = this;
			var register;
			console.log("Your ryde is on it's way! Please wait a few minutes for your ryde to get here.");
			CarRegistry.deployed().then(function(instance) {
				register = instance;
				var costInWei = 1000000000000000000*globalCostInEth;
			//	return register.confirmTrip(carEthAddresses[nearestCar], pos.lat.toString(), pos.lng.toString(), destLatString, destLongString, {from: account, value: costInWei, gas: 10000000, gasPrice: web3.toWei(300, 'gwei')})
			document.getElementById("carControlBlock").style.display = 'block';
			document.getElementById("rydeStatus").innerHTML = "Your ryde is currently being confirmed...";
			document.getElementById("rydeStatus").innerHTML = "Your ryde has been confirmed. Your vehicle is on it's way."

			var date = new Date();
			var curDate = null;
			do { curDate = new Date(); }
			while(curDate-date < 5000);
			return register.confirmTrip(carEthAddresses[nearestCar], pos.lat.toString(), pos.lng.toString(), {from: account, value: costInWei, gas: 167045})
		}).then(function(tx_id){
			console.log("Confirm Ride transaction completed!");
			document.getElementById("rydeStatus").innerHTML = "Your ryde has been confirmed. Your vehicle is on it's way."
			var date = new Date();
			var curDate = null;
			do { curDate = new Date(); }
			while(curDate-date < 5000);
			document.getElementById("rydeStatus").innerHTML = 'Hit the "Begin Your Ryde" button to start the session.';
			//return register.checkTripStatus.call(carEthAddresses[nearestCar], {from: accounts[0]});
		}).then(function(response){
			console.log(response);
		}).catch(function(e) {
			console.log(e);
		});

		document.getElementById("send").disabled = true;
		document.getElementById("confirmButton").disabled = true;
		$("#carControlBlock").removeAttr('hidden');
		document.getElementById("startSessionButton").disabled = false;
		document.getElementById("lockCarButton").disabled = true;
		document.getElementById("unlockCarButton").disabled = true;
		document.getElementById("endSessionButton").disabled = true;
		originialPosition = carLocations[nearestCar].position;
		carLocations[nearestCar].setPosition(pos);

		
	},

	startSession: function(){
		//alert("You have begun your ryde!");
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			var destLatString = destination.geometry.location.lat.toString();
			var destLongString = destination.geometry.location.lng.toString();
			return register.startRide(carEthAddresses[nearestCar], destLatString, destLongString, {from: account})
		}).then(function(tx_id){
			console.log("Start Ride transaction completed!");
			return register.confirmPayment.call(carEthAddresses[nearestCar], {from: account});
		}).then(function(response){
			console.log(response);
		}).catch(function(e) {
			console.log(e);
		});
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 5000);
		document.getElementById("rydeStatus").innerHTML = 'Your vehicle is LOCKED';
		document.getElementById("unlockCarButton").disabled = false;
		document.getElementById("endSessionButton").disabled = false;
		document.getElementById("startSessionButton").disabled = true;;	
	},

	lockCar: function(){
		//alert("You have LOCKED your vehicle!");
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			return register.toggleLock(carEthAddresses[nearestCar], false, {from: account})
		}).then(function(tx_id){
			console.log("Lock transaction completed!");
		}).catch(function(e) {
			console.log(e);
		});
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 5000);
		document.getElementById("rydeStatus").innerHTML = 'Your vehicle is LOCKED';
		document.getElementById("unlockCarButton").disabled = false;
		document.getElementById("lockCarButton").disabled = true;

	},

	unlockCar: function(){
		//alert("You have UNLOCKED your vehicle!");
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			return register.toggleLock(carEthAddresses[nearestCar], true, {from: account})
		}).then(function(tx_id){
			console.log("Unlock transaction compleeted");
		}).catch(function(e) {
			console.log(e);
		});
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 5000);
		document.getElementById("rydeStatus").innerHTML = 'Ryde in progress: your vehicle is UNLOCKED';
		document.getElementById("unlockCarButton").disabled = true;
		document.getElementById("lockCarButton").disabled = false;

	},

	endSession: function(){
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 5000);
		alert("You have ended your ryde! You trip payment is currently being processed.");
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			return register.finishRide(carEthAddresses[nearestCar], {from: account})
		}).then(function(tx_id){
			console.log("Finish ride transaction completed.");
		}).catch(function(e) {
			console.log(e);
		});
		document.getElementById("lockCarButton").disabled = true;
		document.getElementById("unlockCarButton").disabled = true;
		document.getElementById("endSessionButton").disabled = true;
		document.getElementById("startSessionButton").disabled = true;
		document.getElementById("carControlBlock").style.display = 'none';
		document.getElementById("quoteInfoBlock").style.display = 'none';
		document.getElementById("send").disabled = false;
		document.getElementById("confirmButton").disabled = false;

			 	 
	 	var balance = web3.fromWei(web3.eth.getBalance(account), "ether")
	 	self.setElement(balance, 'balance');

		carLocations[nearestCar].setPosition(originialPosition);
		for(var i = 0; i < carLocations.length; i++){
			carLocations[i].setMap(map);
		}
	},

	checkTripStatus: function() {
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			return register.checkTripStatus.call({from: account});
		}).then(function(response){
			console.log(response);
		}).catch(function(e) {
			console.log(e);
		});
	},

	checkLockStatus: function() {
		var self = this;
		var register;
		CarRegistry.deployed().then(function(instance) {
			register = instance;
			return register.checkLockStatus.call({from: account});
		}).then(function(response){
			console.log(response);
		}).catch(function(e) {
			console.log(e);
		});
	},

	handleLocationError: function(browserHasGeolocation, infoWindow, pos) {
		infoWindow.setPosition(pos);
		infoWindow.setContent(browserHasGeolocation ?
			'Error: The Geolocation service failed.' :
			'Error: Your browser doesn\'t support geolocation.');
	},

		// appendMarker: function(map, latitude, longitude, text) {
		// 	var pos = {lat: latitude, lng: longitude};
		// 	var markerOption = {
		// 		position: pos,
		// 		map: map,
		// 		icon: 'https://lh3.googleusercontent.com/-UjKiveTyTUI/VKJ3RyUC0LI/AAAAAAAAAGc/zxBS9koEx6c/s512-p/nnkjn.png',
		// 		title: text || 'Hello World!'
		// 	};
		// 	return new google.maps.Marker(markerOption);
		// },
		codeAddress: function(){
			var self = this;
			$("#quoteInfoBlock").removeAttr('hidden');
			var geocoder = new google.maps.Geocoder();
			var address = document.getElementById('address').value;
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == 'OK') {
					destination = results[0];
					map.setCenter(results[0].geometry.location);
					self.calcRoute();
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});
		},

		calcRoute: function(){
			var self = this;
			var start = pos;
			var end = destination.geometry.location;
			console.log("destination: " + destination);
			var request = {
				origin: start,
				destination: end,
				travelMode: 'DRIVING'
			};
			console.log("Start: " + start);
			console.log("End: " + end);

			userLoc.setMap(null);
			directionsDisplay.setMap(map);
	//directionsDisplay.setPanel(do)


	directionsService.route(request, function(result, status) {
		if (status == 'OK') {
			console.log("Your directions are being rendered");
			directionsDisplay.setDirections(result);

			var legs = result.routes[0].legs;
			var totalDistance = 0;
			var totalDuration = 0;
			for(var i=0; i<legs.length; ++i) {
				totalDistance += legs[i].distance.value;
				totalDuration += legs[i].duration.value;
			}
			totalDistance = Math.ceil(totalDistance * 0.0621371)/100;
			totalDuration = Math.ceil(totalDuration / 60);
			console.log("Distance to Destination: " + totalDistance + " miles");
			console.log("Estimated Time: " + totalDuration + " minutes");
			self.setElement(destination.formatted_address, 'destinationRequested');
			self.setElement(totalDistance + " miles", 'distanceEstimate');
			self.setElement(totalDuration + " minutes", 'timeEstimate');
			var register;
			CarRegistry.deployed().then(function(instance) {
				register = instance;
				return register.returnRates.call({from: account});
			}).then(function(rateInfo) {
				return (parseFloat(rateInfo[0]) + (parseFloat(rateInfo[1])*totalDuration) + (parseFloat(rateInfo[2]*totalDistance)))/50;
			}).then(function(cost) {
				globalCostInEth = cost;
				var costInDollars = cost*50;
				self.setElement(cost + " ether", 'costEstimate');
				self.setElement("$" + costInDollars, 'costEstimateDollars');
			}).catch(function (e){
				console.log(e);
			});
			document.getElementById("confirmButton").style.visibility = 'visible';
				//self.setElement("you cannot afford this", 'costEstimate');
				document.getElementById("quoteInfoBlock").style.display = 'block';
				self.findNearestCar();

			}else{
				console.log("Problem with destination entered. Please try again.");
			}
		});
}
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
  	console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
	 // Use Mist/MetaMask's provider
	 window.web3 = new Web3(web3.currentProvider);
	} else {
		console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
	 // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
	 window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

	}

	$('#address').keydown(function (event) {
		var keypressed = event.keyCode || event.which;
		if (keypressed == 13) {
			App.codeAddress();
		}
	});

	App.start();
});


window.initMap = function() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.521, lng: -74.4623},
		zoom: 10
	});
	var infoWindow = new google.maps.InfoWindow({map: map});

		  // Try HTML5 geolocation.
		  if (navigator.geolocation) {
		  	navigator.geolocation.getCurrentPosition(function(position) {
		  		pos = {
		  			lat: position.coords.latitude,
		  			lng: position.coords.longitude
		  		};
		  		console.log("The user is at: " + pos.lat + " and " + pos.lng);
		  		userLoc = new google.maps.Marker({
		  			position: pos,
		  			map: map
		  		});
			 //appendMarker(map, 40.4317, -74.4050, "Car 1");
			 //appendMarker(map, 40.594, -74.6049, "Car 2");
			 map.setCenter(pos);
			}, function() {
				handleLocationError(true, infoWindow, map.getCenter());
			}, {timeout: 10000});
		  	google.maps.event.addDomListener(window, 'load', initializeAutoComplete);

		  } else {
			 // Browser doesn't support Geolocation
			 handleLocationError(false, infoWindow, map.getCenter());
			}
		}
		function initializeAutoComplete(){
			var input = document.getElementById("address");
			var autocomplete = new google.maps.places.Autocomplete(input);
		}
		function handleLocationError(browserHasGeolocation, infoWindow, pos) {
			infoWindow.setPosition(pos);
			infoWindow.setContent(browserHasGeolocation ?
				'Error: The Geolocation service failed.' :
				'Error: Your browser doesn\'t support geolocation.');
		}

		function appendMarker(map, latitude, longitude, text) {
			var pos = {lat: latitude, lng: longitude};
			var markerOption = {
				position: pos,
				map: map,
				icon: 'http://www.wcbuzz.com/file/2015/09/car-service-car-with-tool-icon-on-yellow-map-pointer-vector-illustration_187389968.jpg.png',
				title: text || 'Hello World!'
			};
			return new google.maps.Marker(markerOption);
		}