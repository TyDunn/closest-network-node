var networkNodes = [
  {
    "name": "node1",
    "longitude": -83.06849,
    "latitude": 42.50607
  },
  {
    "name": "node2",
    "longitude": -83.20394,
    "latitude": 42.10293
  },
  {
    "name": "node3",
    "longitude": -83.69704,
    "latitude": 42.33495
  }
]

var existingLocations = [
  {
    "address": "1551 Rosa Parks Blvd, Detroit, MI 48216, USA",
    "latitude": 42.327095,
    "longitude": -83.070275
  },
  {
    "address": "M@dison Building, 1555 Broadway St, Detroit, MI 48226, USA",
    "latitude": 42.3360645,
    "longitude": -83.0494705
  },
  {
    "address": "1505 Woodward Ave, Detroit, MI 48226, USA",
    "latitude": 42.3349467,
    "longitude": -83.0498413
  }
]

      function initMap() {

         $("#popup-panel").hide();

        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 17,
          center: {lat: 42.334947, lng: -83.049841}
        });

        var directionsDisplay = new google.maps.DirectionsRenderer;
        var directionsService = new google.maps.DirectionsService;
        var geocoder = new google.maps.Geocoder();

        /* $(document).ready(function(){
          $('#address').keypress(function(e){
            if(e.keyCode==13)
            $('#submit').click();
          });
        });
        */

        document.getElementById('submit').addEventListener('click', function() {

            geocodeInputAddress(geocoder, function(inputAddress){

              if(isExistingLocation(inputAddress, existingLocations)) {

                map = new google.maps.Map(document.getElementById('map'), {
                  zoom: 18,
                  center: {lat: inputAddress.latitude, lng: inputAddress.longitude}
                });

                marker = new google.maps.Marker({ position: {lat: inputAddress.latitude, lng: inputAddress.longitude}, 
                                                             map: map, 
                                                             title: inputAddress.address });

              document.getElementById('address').value = '';
              $("#popup-panel").html("<p>" + inputAddress.address + " is already an existing location" + "</p>");
              $("#popup-panel").show();
              
              } else {

                directionsDisplay.setMap(map);
                closestNode = determineClosestNode(networkNodes, inputAddress);
                calculateAndDisplayRoute(directionsService, directionsDisplay, inputAddress, closestNode);
              }
            });

            
        });
      
      }

      function geocodeInputAddress(geocoder, callback) {
        var address = document.getElementById('address').value;

        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
          	
            var inputAdd = {
             address: results[0].formatted_address,
             latitude: results[0].geometry.location.lat(),
             longitude: results[0].geometry.location.lng()
           };
           
           callback(inputAdd);

          } else {
            
            if (status === 'ZERO_RESULTS') {
              
              $("#popup-panel").html("<p>Not a valid address. Please enter a new address.</p>");
              $("#popup-panel").show();
            
            } else {

              alert("Geocode was not successful for the following reason: " + status);

            }


          }
        });
      }

      function calculateAndDisplayRoute(directionsService, directionsDisplay, inputAddress, closestNode) {
        directionsService.route({
          origin: {lat: closestNode.latitude, lng: closestNode.longitude},
          destination: {lat: inputAddress.latitude, lng: inputAddress.longitude},
          travelMode: google.maps.TravelMode["WALKING"]
        }, function(response, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(response);
            var distanceMeters = response.routes[0].legs[0].distance.value
            var distanceFeet = Math.round(distanceMeters * 3.28084)
            var distanceString = distanceFeet.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            $("#popup-panel").html("<p>" + 
                                   inputAddress.address + 
                                   " is an estimated " + 
                                   distanceString + 
                                   " feet from our network" + 
                                   "</p>");
            $("#popup-panel").show();
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }

      function isExistingLocation(inputAddress, existingLocations) {

        for (i = 0; i < existingLocations.length; i++) {

          if (inputAddress.address === existingLocations[i].address) {
    
              return true;

        }
      
      }

      return false; 

      };

function determineClosestNode(networkNodes, inputAddress) {

  for (i = 0; i < networkNodes.length; i++) {
    
      var xDistance = inputAddress.latitude - networkNodes[i].latitude;
      
      var yDistance = inputAddress.longitude - networkNodes[i].longitude;

      var distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
      
      networkNodes[i].distance = distance;

  }

  var closestNode = {
        name: networkNodes[0].name,
        latitude: networkNodes[0].latitude,
        longitude: networkNodes[0].longitude,
        distance: networkNodes[0].distance
      }

  for(i = 0; i < networkNodes.length; i++) {

    if (networkNodes[i].distance < closestNode.distance) {
      
        closestNode.name = networkNodes[i].name;
        closestNode.latitude = networkNodes[i].latitude;
        closestNode.longitude = networkNodes[i].longitude;
        closestNode.distance = networkNodes[i].distance;
      
      }
  }

return closestNode;

};