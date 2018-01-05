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
  currentMarkers: any[] = [];
  cars: any[] = [];

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, private afAuth: AngularFireAuth, private usersProvider: UsersProvider) {
    
  }

  ionViewDidLoad() {
    // this.showMap();
    // this.printSelector();
    //this.loadGoogleMap();
    var currentUser = this.usersProvider.findByUid(this.afAuth.auth.currentUser.uid);
    
    currentUser.subscribe((users) => {
      //console.log(users);
      let userCars = users[0]['cars'];
      Object.keys(userCars).map(key => { 
        this.cars.push(userCars[key]);
      });

      this.loadGoogleMap();
    })
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

        if(this.cars.length > 1) {
          this.map.setCameraZoom(11);
        }

        for(var i = 0; i < this.cars.length; i++) {
          this.db.list('/events', ref => ref.orderByChild('Imei').equalTo(this.cars[i].Imei)).valueChanges()
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
            console.log(lastTracker);

            const latlng = {
              lat: lastTracker.Latitude,
              lng: lastTracker.Longitude
            };
            
            // Anima a camera apenas se existir um carro
            if(this.cars.length == 1) {
              this.map.animateCamera({
                'target': latlng,
              }, function() {
                console.log("Camera position changed.");
              });
            }
            
            // Adiciona marcador do carro
            const car = this.findCarByImei(lastTracker.Imei);

            if(this.currentMarkers[lastTracker.Imei]) {
              this.currentMarkers[lastTracker.Imei].remove();
            }

            this.map.addMarker({
              title: car.Modelo + ' ' + car.Cor + " - " + car.Ano +  ' (' + car.Placa + ')',
              icon: 'blue',
              animation: 'DROP',
              position: latlng
            })
            .then(marker => {
              this.currentMarkers[lastTracker.Imei] = marker;
            });        
          });
        }
        
      });
  }

  findCarByImei(imei: String) : any{
    for(var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].Imei == imei) {
        return this.cars[i];
      }
    }
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
