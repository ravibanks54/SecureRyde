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

var myCarRegistryInstance;
var account;
var accounts;

function intializeCarRegistry() {
	alert("hi srimom");
	CarRegistry.new({from: accounts[3], gas: 3141592}).then(
	function(register) {
		console.log(register);
		myCarRegistryInstance = register;
		checkCarLocations();
	});
}

function checkCarLocations() {
	myCarRegistryInstance.registeredCars.call().then(
	function(registeredCars) { 
		registeredCars.forEach(function markerPosition(carAddress){
			console.log(myCarRegistryInstance.returnPosition.call(carAddress));
		});
		return;
	});
}

window.onload = function(){
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
	    intializeCarRegistry();
	})
}
