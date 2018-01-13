import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';

@IonicPage()
@Component({
  selector: 'page-list-detail',
  templateUrl: 'list-detail.html',
})
export class ListDetailPage {
  eventId = this.navParams.get('eventId'); 
  latitude = this.navParams.get('latitude'); 
  longitude = this.navParams.get('longitude'); 
  item: Object;
  
  @ViewChild('map') mapRef: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, private navParams: NavParams, db: AngularFireDatabase) {

    var device = db.database.ref('/historic/' + this.eventId).once('value');
    device.then(results => {      
      this.item = results.val()
    })    

    //ou

    // db.list('/events/' + this.eventId)
    // .snapshotChanges()
    // .map(
    //   action =>{ 
    //     return action.map(
    //       act => {            
    //         let obj = {}            
    //         obj[act.payload.key] = act.payload.toJSON()
    //         return obj;
    //       }
    //     )
    //   }
    // )
    // .subscribe(
    //   result => {
    //     let aux = {};

    //     result.map(
    //       res => {
    //         Object.assign(aux, res)
    //       }
    //     )
    //     this.item = aux
    //   }
    // )    
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
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 15,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('map', mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        this.map.addMarker({
          title: 'Ionic',
          icon: 'blue',
          animation: 'DROP',
          position: {
            // lat: -12.9996967,
            // long: -38.510406
            lat: this.latitude,
            lng: this.longitude
          }
        })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {

              });
          });

      });
  }

}
