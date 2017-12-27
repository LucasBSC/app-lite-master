import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapRef: ElementRef;
  map: any;

  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    // this.showMap();
    // this.printSelector();
    this.loadGoogleMap();
  }

  loadGoogleMap() {
    let mapOptions: GoogleMapOptions = {
      controls: {
        zoom: true
      },
      camera: {
        target: {
          // lat: -12.9996967,
          // long: -38.510406
          lat: -12.999490,
          lng: -38.510411
        },
        zoom: 15,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('map', mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        this.map.addMarker({
          title: 'Cliente1,Carro:Audi a8,Telefone:91919293',
		  
          icon: 'blue',
          animation: 'DROP',
          position: {
            // lat: -12.9996967,
            // long: -38.510406
            lat: -12.999490,
            lng: -38.510411
          }
        })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {

              });
          });

      });
  }

  // showMap() {
  //   // location: Lat, Long
  //   const location = new google.maps.LatLng(-12.9995586,-38.5106808);

  //   // Map options
  //   const options = {
  //     center: location,
  //     zoom: 17
  //   }

  //   const map = new google.maps.Map(this.mapRef.nativeElement, options);

  //   this.addMarker(location, map);
  // }

  // addMarker(position, map) {
  //   return new google.maps.Marker({
  //     position,
  //     map
  //   });
  // }

}
