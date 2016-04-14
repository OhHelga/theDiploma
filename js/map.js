$(document).ready(function () {
	initialize();
});

//инициализация карты в div "map"
function initialize() {
    var haightAshbury = new google.maps.LatLng(50.449696, 30.4588);//(долгота, широта)
    var mapOptions = {
        zoom: 16,//масштаб
        center: haightAshbury,//позиционируем карту на заданые координаты
        mapTypeId: google.maps.MapTypeId.ROADMAP//задаем тип карты
    };    
    map = new google.maps.Map(document.getElementById("map"), mapOptions);//инициализация карты
 
    google.maps.event.addListener(map, 'click', function (event) {
        addMarker(event.latLng);
    });//добавляем событие нажание мышки
}
//функция добавления маркера
function addMarker(location) {
 
    var shadow = new google.maps.MarkerImage('/Images/roles.png',    
    new google.maps.Size(37, 32),
    new google.maps.Point(0, 0),
    new google.maps.Point(0, 32)); // Теневое изображение
 
    var image = new google.maps.MarkerImage('/Images/smilies.png',
      new google.maps.Size(20, 32),
      new google.maps.Point(0, 0),
      new google.maps.Point(0, 32)); //изображение маркера
 
    marker = new google.maps.Marker({
        position: location,
        map: map,
        shadow: shadow,
        icon: image,
        title: "My title!)",
        zIndex: 999
    });//добавление маркера
}