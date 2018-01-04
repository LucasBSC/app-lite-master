import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { UsersProvider } from '../../providers/users/users';

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
  events: Observable<any[]>;
  currentMarker: any;
  car: any;

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, private afAuth: AngularFireAuth, private usersProvider: UsersProvider) {
    var currentUser = this.usersProvider.findByUid(this.afAuth.auth.currentUser.uid);
    console.log(this.afAuth.auth.currentUser);
    currentUser.subscribe((users) => {
      //console.log(users);
      let userCars = users[0]['cars'];
      Object.keys(userCars).map(key => { 
        this.car = userCars[key];
      });
    })
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
        console.log('carimei', this.car);
        this.db.list('/events', ref => ref.orderByChild('Imei').equalTo(this.car.Imei)).valueChanges()
        .subscribe(result => {
          // Recupera o ultimo tracker
          console.log('events', result);
          var lastTracker = null;
          Object.keys(result).map(key => { 
            if(result[key].Tipo.toLowerCase() == 'tracker') {
              lastTracker = result[key];
            }
          });

          // Se nenhum evento de tracker for encontrado, a função é encerrada
          if(!lastTracker) {
            return;
          }
          

          this.map.clear()
          // Remove o marker anterior
          const latlng = {
            lat: lastTracker.Latitude,
            lng: lastTracker.Longitude
          };
          console.log('car', this.car);
          console.log('event', lastTracker);
          // Adiciona o novo marker
          
          this.map.animateCamera({
            'target': latlng,
          }, function() {
            console.log("Camera position changed.");
          });
          this.map.addMarker({
            title: this.car.Modelo + ' - ' + this.car.Cor + ' (' + this.car.Placa + ')',
            icon: 'blue',
            animation: 'DROP',
            position: latlng
          })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {

              });
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
