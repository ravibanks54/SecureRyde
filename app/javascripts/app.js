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

window.App = {
  start: function() {
	 var self = this;

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
		self.setStatus("Loading");
		return register.returnPosition.call(account, {from: account});
	 }).then(function(value) {
		self.setStatus(value);
	 }).catch(function(e) {
		console.log(e);
		self.setStatus("error");
	 });
  },
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
		},
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
		title: text || 'Hello World!'
	 };
	 return new google.maps.Marker(markerOption);
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

  App.start();
});
window.initMap = function() {
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
		title: text || 'Hello World!'
	 };
	 return new google.maps.Marker(markerOption);
}
*/
