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

  /**
   * Marcadores no mapa
   */
  currentMarkers: any[] = [];

  /**
   * Carros carregados
   */
  cars: any[] = [];

  /**
   * Usuario logado
   */
  currentUser: any;

  /**
   * Verifica se o usuário está compartilhando a localização
   */
  sharingPosition: boolean;
  

  /**
   * Configurações do botão de compartilhar
   */
  shareButtonColor: string = "";
  shareButtonShow: boolean = false;
  shareButtonText: string = "COMPARTILHAR LOCALIZAÇÃO";

  /**
   * Configurações da indicador do alarme
   */
  alarmDivColor: string;
  
  /**
   * Constantes
   */
  DEFAULT_ZOOM_LEVEL: number = 11;
  DEFAULT_PANIC_ON: "help me";
  DEFAULT_PANIC_OFF: "help me off"

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, private afAuth: AngularFireAuth, private usersProvider: UsersProvider) {
  }

  /**
   * Carrega os carros do usuário
   */
  ionViewDidLoad() {
    // Carrega o usuário atual
    const user = this.usersProvider.findByUid(this.afAuth.auth.currentUser.uid);
    
    user.subscribe((users) => {
      // Carrega os carros do dono
      this.currentUser = users[0];
      let userCars = users[0]['cars'];
      Object.keys(userCars).map(key => {
        userCars[key]["mine"] = true; 
        this.cars.push(userCars[key]);
      });
      
      // Carrega os carros compartilhados
      let sharedUsers = users[0]['sharedWithMe'];
      if(sharedUsers) {
        Object.keys(sharedUsers).map(key => {
          // Sub nos usuarios que compartilham com o usuario logado
          const sharedUser = this.usersProvider.findByUid(sharedUsers[key]);
          sharedUser.subscribe((users) => {
            const user : any = users[0];
            const sharedCars = user['cars'];
  
            // Varre os carros do usuario compartilhdador
            Object.keys(sharedCars).map(key => {
              sharedCars[key]["mine"] = false; 
              sharedCars[key]["sharing"] = false; 
              this.cars.push(sharedCars[key]);
            });
          }) 
        });
      }
      this.loadGoogleMap();
    })
  }

  /**
   * Instancia um novo mapa e inscreve os carros carregados
   */
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
        zoom: this.DEFAULT_ZOOM_LEVEL,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('map', mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        for(var i = 0; i < this.cars.length; i++) {
          this.subscribeCarByImei(this.cars[i].Imei);
        }
      });
  }

  /**
   * Inscreve o carro na sua lista de eventos
   * @param imei Imei do carro a ser inscrito
   */
  subscribeCarByImei(imei : string) {
    this.db.list('/events', ref => ref.orderByChild('Imei').equalTo(imei)).valueChanges()
    .subscribe(result => {

      // Recupera os ultimos eventos relavantes para o carro
      var lastTracker = null;
      var lastSos = null;
      var lastAlarm = null;
      Object.keys(result).map(key => { 
        switch(result[key].Tipo.toLowerCase()) {
          case 'tracker':
            lastTracker = result[key];
            break;
          case 'help me':
            lastSos = result[key];
            break;
          case 'help me off':
            lastSos = result[key];
            break;
          case 'lt':
          case 'mt':
            lastAlarm = result[key];
            break;
        }
      });

      // Recupera o carro pelo Imei
      const car = this.getCarByImei(lastTracker.Imei);

      if(!car) {
        return;
      }

      // Verifica se o dono do carro está com o compartilhamento  e alarme ligados 
      if(car.mine) {
        this.changeShareButtonStyle(lastSos && lastSos.Tipo.toLowerCase() == 'help me');
        this.alarmDivColor = lastAlarm && lastAlarm.Tipo.toLowerCase() == 'lt' ? 'green' : 'red';
      } 
      // Verifica se o carro dos amigos está sendo compartilhado no momento
      else {
        car.sharing = lastSos && lastSos.Tipo == 'help me';
        if(this.currentMarkers[lastTracker.Imei]) {
          this.currentMarkers[lastTracker.Imei].setVisible(car.sharing);
        }
      }
      
      // Apenas muda a posição do carro em questão se ele for do usuario ou estiver com o compartilhamento ligado
      if(!car.mine && !car.sharing) {
        return;
      }

      const latlng = {
        lat: lastTracker.Latitude,
        lng: lastTracker.Longitude
      };
    
      // Anima a camera apenas se existir um carro
      if(this.countVisibleCars() == 1) {
        this.map.animateCamera({
          'target': latlng
        }, function() {
          console.log("Camera position changed.");
        });
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

  /**
   * Envia um novo evento para habilitar / desabilitar o compartilhamento do carro
   */
  onSharePositionClick() : void {
      const date = new Date();
      const dateYear = date.getFullYear();
      const dateMonth = this.zeroLeft(date.getMonth() + 1);
      const dateDate = this.zeroLeft(date.getDate());
      const dateHour = this.zeroLeft(date.getHours());
      const dateMinutes = this.zeroLeft(date.getMinutes());
      const dateSeconds = this.zeroLeft(date.getSeconds());
      const keyDate = dateYear + dateMonth + dateDate + dateHour + dateMinutes + dateSeconds;
      const myCarImei = this.getMyCarImei();
      const key = "data" + keyDate + "imei" + myCarImei;
      this.db.database.ref().child('events').child(key).set({
        Data: dateDate + "/" + dateMonth + "/" + dateYear + "-" + dateHour + "-" + dateMinutes + "-" + dateSeconds,//"07/01/2018-12-40-24",
        Imei: myCarImei,
        Latitude: "0",
        Longitude: "0",
        Tipo: this.sharingPosition ? 'help me off' : 'help me'
      });
  }

  /**
   * Conta a quantidade de carros disponiveis para exibição no mapa
   */
  countVisibleCars() : number {
    var count = 0;
    for(var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].mine || this.cars[i].sharing) {
        count++;
      }
    }

    return count;
  }

  /**
   * Recupera o Imei do carro do usuário (Partindo da premissa de que existe apenas um carro por usuario)
   */
  getMyCarImei() {
    for(var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].mine) {
        return this.cars[i].Imei;
      }
    }

    return null;
  }

  /**
   * Pesquisa o imei desejado na lista de carros carregados
   * @param imei Imei a ser pesquisado
   */
  getCarByImei(imei : string) {
    for(var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].Imei == imei) {
        return this.cars[i];
      }
    }

    return null;
  }

  /**
   * Altera o botão de compartilhamento conforme status do usuario
   * @param sharing Informaçao se o usuario está compartilhando a posição
   */
  changeShareButtonStyle(sharing : boolean) {
    this.sharingPosition = sharing;
    this.shareButtonShow = true;
    this.shareButtonColor = sharing ? "green" : "#8B1C00"
    this.shareButtonText = sharing ? "PARAR COMPARTILHAMENTO" : "COMPARTILHAR LOCALIZAÇÃO";
  }

  /**
   * Adiciona zero a esqueda se o valor for menor do que 10
   * @param value Numero
   */
  zeroLeft(value : any) {
    if(value < 10) {
      value = "0" + value;
      return value;
    }
    return JSON.stringify(value);
  }

}
