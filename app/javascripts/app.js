// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

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


window.App = {
	start: function() {
		var self = this;
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsService = new google.maps.DirectionsService();

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
			var pos = register.getLocationByIndex.call(i, {from: account});
			console.log(pos);
			posArr.push(pos);
		}
		return Promise.all(posArr);
	}).then(function(array){
		for (var i = array.length - 1; i >= 0; i--) {
			appendMarker(map, parseFloat(array[i][0]), parseFloat(array[i][1]), "car");
		}
		return array;
	}).then(function(value) {
		//self.setStatus(value);
	}).catch(function(e) {
		console.log(e);
		//self.setStatus("error");
	});
  },/*
  initMap: function(){
  		var self = this;
		  var map = new google.maps.Map(document.getElementById('map'), {
			 center: {lat: 40.521, lng: -74.4623},
			 zoom: 6
		  });
		  var infoWindow = new google.maps.InfoWindow({map: map});

		  // Try HTML5 geolocation.
		  if (navigator.geolocation) {
			 navigator.geolocation.getCurrentPosition(function(position) {
				var pos = {
				  lat: position.coords.latitude,
				  lng: position.coords.longitude
				};

				var userLoc = new google.maps.Marker({
				position: pos,
				map: map
			 });
			 self.appendMarker(map, 40.4317, -74.4050, "Car 1");
			 self.appendMarker(map, 40.594, -74.6049, "Car 2");
				map.setCenter(pos);
			 }, function() {
				self.handleLocationError(true, infoWindow, map.getCenter());
			 });
		  } else {
			 // Browser doesn't support Geolocation
			 self.handleLocationError(false, infoWindow, map.getCenter());
		  }
		},*/
		handleLocationError: function(browserHasGeolocation, infoWindow, pos) {
			infoWindow.setPosition(pos);
			infoWindow.setContent(browserHasGeolocation ?
				'Error: The Geolocation service failed.' :
				'Error: Your browser doesn\'t support geolocation.');
		},

		appendMarker: function(map, latitude, longitude, text) {
			var pos = {lat: latitude, lng: longitude};
			var markerOption = {
				position: pos,
				map: map,
				icon: 'https://lh3.googleusercontent.com/-UjKiveTyTUI/VKJ3RyUC0LI/AAAAAAAAAGc/zxBS9koEx6c/s512-p/nnkjn.png',
				title: text || 'Hello World!'
			};
			return new google.maps.Marker(markerOption);
		},
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
					return (parseFloat(rateInfo[0]) + (parseFloat(rateInfo[1])*totalDuration) + (parseFloat(rateInfo[2]*totalDistance)))/50.10;
				}).then(function(cost) {
					self.setElement(cost + " ether", 'costEstimate')
				});
				//self.setElement("you cannot afford this", 'costEstimate');

			}else{
				console.log("Problem with destination entered. Please try again.");
			}
		});
	}

/*
  refreshBalance: function() {
	 var self = this;

	 var meta;
	 MetaCoin.deployed().then(function(instance) {
		meta = instance;
		return meta.getBalance.call(account, {from: account});
	 }).then(function(value) {
		var balance_element = document.getElementById("balance");
		balance_element.innerHTML = value.valueOf();
	 }).catch(function(e) {
		console.log(e);
		self.setStatus("Error getting balance; see log.");
	 });

  

  sendCoin: function() {
	 var self = this;

	 var amount = parseInt(document.getElementById("amount").value);
	 var receiver = document.getElementById("receiver").value;

	 this.setStatus("Initiating transaction... (please wait)");

	 var meta;
	 MetaCoin.deployed().then(function(instance) {
		meta = instance;
		return meta.sendCoin(receiver, amount, {from: account});
	 }).then(function() {
		self.setStatus("Transaction complete!");
		self.refreshBalance();
	 }).catch(function(e) {
		console.log(e);
		self.setStatus("Error sending coin; see log.");
	});*/
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

		  		userLoc = new google.maps.Marker({
		  			position: pos,
		  			map: map
		  		});
			 //appendMarker(map, 40.4317, -74.4050, "Car 1");
			 //appendMarker(map, 40.594, -74.6049, "Car 2");
			 map.setCenter(pos);
			}, function() {
				handleLocationError(true, infoWindow, map.getCenter());
			});
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
				icon: 'https://cdn1.iconfinder.com/data/icons/automotix/128/bug_car_small_vintage_limousine-128.png',
				title: text || 'Hello World!'
			};
			return new google.maps.Marker(markerOption);
		}

/*
function initMap() {
		  var map = new google.maps.Map(document.getElementById('map'), {
			 center: {lat: 40.521, lng: -74.4623},
			 zoom: 6
		  });
		  var infoWindow = new google.maps.InfoWindow({map: map});

		  // Try HTML5 geolocation.
		  if (navigator.geolocation) {
			 navigator.geolocation.getCurrentPosition(function(position) {
				var pos = {
				  lat: position.coords.latitude,
				  lng: position.coords.longitude
				};

				var userLoc = new google.maps.Marker({
				position: pos,
				map: map
			 });
			 appendMarker(map, 40.4317, -74.4050, "Car 1");
			 appendMarker(map, 40.594, -74.6049, "Car 2");
				map.setCenter(pos);
			 }, function() {
				handleLocationError(true, infoWindow, map.getCenter());
			 });
		  } else {
			 // Browser doesn't support Geolocation
			 handleLocationError(false, infoWindow, map.getCenter());
		  }
		}

		*/
