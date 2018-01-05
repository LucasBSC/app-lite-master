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
  currentUser: any;
  
  shareButtonColor: string = "";
  shareButtonShow: boolean = false;
  shareButtonText: string = "COMPARTILHAR LOCALIZAÇÃO";

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, private afAuth: AngularFireAuth, private usersProvider: UsersProvider) {
    
  }

  ionViewDidLoad() {
    // Carrega o usuário atual
    const user = this.usersProvider.findByUid(this.afAuth.auth.currentUser.uid);
    
    user.subscribe((users) => {
      // Carrega os carros do dono
      this.currentUser = users[0];
      console.log("current user", this.currentUser);
      this.changeShareButtonStyle(this.currentUser.share);
      let userCars = users[0]['cars'];
      Object.keys(userCars).map(key => {
        try{
          userCars[key]["mine"] = true; 
          this.cars.push(userCars[key]);
        } catch (err) {
          console.log("mine");
          console.log(err);
        }
      });
      
      // Carrega os carros compartilhados
      let sharedUsers = users[0]['sharedWithMe'];
      Object.keys(sharedUsers).map(key => {
        // Sub nos usuarios que compartilham com o usuario logado
        const sharedUser = this.usersProvider.findByUid(sharedUsers[key]);
        sharedUser.subscribe((users) => {
          const user : any = users[0];
          const sharedCars = user['cars'];

          // Varre os carros do usuario compartilhdador
          Object.keys(sharedCars).map(key => {
            const car = this.findCarByImei(sharedCars[key]['Imei']);

            // Verifica se o usuário está compartilhando os carros
            if(user.share){
              sharedCars[key]["mine"] = false;
              sharedCars[key]["sharing"] = true;
              if(car) {
                this.cars[car['Imei']] = sharedCars[key];
                this.currentMarkers[car['Imei']].setVisible(true);
              } else {
                this.cars.push(sharedCars[key]);
                this.subscribeCarByImei(sharedCars[key]['Imei']);
              }
            } else if(car){
              car['sharing'] = false;
              this.currentMarkers[car['Imei']].setVisible(false);  
            }
          });
        }) 
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
          this.subscribeCarByImei(this.cars[i].Imei);
        }
      });
  }

  subscribeCarByImei(imei : string) {
    this.db.list('/events', ref => ref.orderByChild('Imei').equalTo(imei)).valueChanges()
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
      if(this.countVisibleCars() == 1) {
        this.map.animateCamera({
          'target': latlng,
        }, function() {
          console.log("Camera position changed.");
        });
      }
      
      // Adiciona marcador do carro
      const car = this.findCarByImei(lastTracker.Imei);
      if(!car.mine && !car.sharing) {
        return;
      }

      if(this.currentMarkers[lastTracker.Imei]) {
        this.currentMarkers[lastTracker.Imei].setPosition(latlng);
      } else {
        this.map.addMarker({
          title: car.Modelo + ' ' + car.Cor + " - " + car.Ano +  ' (' + car.Placa + ')',
          icon: car.mine ? 'blue' : 'yellow',
          animation: 'DROP',
          position: latlng
        })
        .then(marker => {
          this.currentMarkers[lastTracker.Imei] = marker;
        });          
      }
    });
  }

  findCarByImei(imei: string) : any{
    for(var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].Imei == imei) {
        return this.cars[i];
      }
    }
    return null;
  }

  countVisibleCars() : number {
    var count = 0;
    for(var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].mine || this.cars[i].sharing) {
        count++;
      }
    }

    return count;
  }
 
  onSharePositionClick() : void {
    console.log(this.currentUser);
      this.currentUser.share = !this.currentUser.share;
      this.usersProvider.updateUser(this.currentUser.uid, this.currentUser);
      this.changeShareButtonStyle(this.currentUser.share);
  }

  changeShareButtonStyle(sharing : boolean) {
    this.shareButtonShow = true;
    this.shareButtonColor = sharing ? "green" : "#8B1C00"
    this.shareButtonText = sharing ? "PARAR COMPARTILHAMENTO" : "COMPARTILHAR LOCALIZAÇÃO";
  }

}
