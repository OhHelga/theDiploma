$(document).ready(function () {
	//initialize();
});

var map;

//инициализация карты в div "map"
function initialize() {

    var haightAshbury = new google.maps.LatLng(50.449696, 30.4588);//(долгота, широта)
    var mapOptions = {
        zoom: 14,//масштаб
        center: haightAshbury,//позиционируем карту на заданые координаты
        mapTypeId: google.maps.MapTypeId.ROADMAP//задаем тип карты
    };    
    map = new google.maps.Map(document.getElementById("map"), mapOptions);//инициализация карты
}
//функция добавления маркера
function addMarker(lat, lng, contentString) {
 
/*    var shadow = new google.maps.MarkerImage('/Images/roles.png',
    new google.maps.Size(37, 32),
    new google.maps.Point(0, 0),
    new google.maps.Point(0, 32)); // Теневое изображение
 
    var image = new google.maps.MarkerImage('/Images/smilies.png',
      new google.maps.Size(20, 32),
      new google.maps.Point(0, 0),
      new google.maps.Point(0, 32)); //изображение маркера
 */
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),//location,
        map: map,
        //shadow: shadow,
        //icon: image,
        //title: title,
        zIndex: 999
    });//добавление маркера

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });

    return marker;
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}