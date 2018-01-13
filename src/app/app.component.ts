import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NavController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController } from 'ionic-angular';
import { PagamentoPage } from '../pages/pagamento/pagamento';
import { ContatoPage } from '../pages/contato/contato';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { UsersProvider } from '../providers/users/users';
import { AngularFireDatabase } from 'angularfire2/database';
import { Events } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import { FCM } from '@ionic-native/fcm';
import axios from 'axios';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  pages: Array<{title: string, component: any, icon?: string}>;

  currentUser: any;
  alarmToggle : any;

  config: any = {
    api: {
      urls : {
        baseUrl: "http://173.230.133.203:8082/api",
      },
      auth: {
        user: "contato@interakt.com.br",
        password: "renault2016"
      }
    }
  };

  constructor(
    private afAuth: AngularFireAuth,
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public Alert: AlertController,
    private usersProvider: UsersProvider,
    public db: AngularFireDatabase,
    public events: Events,
    private dialogs: Dialogs,
    private fcm: FCM
  ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Tela Inicial', component: HomePage, icon: 'home' },
      { title: 'Histórico', component: ListPage, icon: 'pin' },
      //{ title: 'Pagamento', component: PagamentoPage, icon: 'cash' },
	    { title: 'Contato', component:ContatoPage, icon: 'people' },
    ];
    fcm.subscribeToTopic('default');
    events.subscribe("user:logged", (userLogged) => {
      this.db.database.ref('users/' + this.afAuth.auth.currentUser.uid).once("value").then((snapshot) => {
        this.currentUser = snapshot.val();
        const cars = (snapshot.val() && snapshot.val().cars);
        var imei = null;
        Object.keys(cars).map((key) => {
          imei = cars[key].Imei;
        });

        fcm.getToken().then(token => {
          this.sendTokenToServer(cars, token, this.currentUser);
        })
        
        fcm.onTokenRefresh().subscribe(token => {
          this.sendTokenToServer(cars, token, this.currentUser);
        })

        this.db.list('/events', ref => ref.orderByChild('Imei').equalTo(imei)).valueChanges().subscribe((events) => {
          var lastAlarmEvent = null;
          Object.keys(events).map(key => { 
            switch(events[key].Tipo.toLowerCase()) {
              case 'lt':
                lastAlarmEvent = events[key];
                break;
              case 'mt':
                lastAlarmEvent = events[key];
                break;
            }
          });

          this.alarmToggle = lastAlarmEvent.Tipo.toLowerCase() == 'lt'
        });
      });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };

    
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  async logout() {
    try {
      this.afAuth.auth.signOut();
      this.nav.setRoot(LoginPage);
      // this.navCtrl.setRoot(LoginPage);
    } catch (e) {
      console.error(e);
    }
  }

  doPrompt() {
    let alert = this.Alert.create({
      title: 'INSIRA SEU CÓDIGO SMART',

      inputs: [
        {
          name: 'Smart Code',
          placeholder: 'Ex:00000001'
        },
      ],
      buttons: [
        {
          text: 'CANCELAR',
          handler: (data: any) => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: (data: any) => {
            console.log('Saved clicked');
          }
        }
      ]
    });

    alert.present();
  }
   doPromptContato() {
    let alert = this.Alert.create({
      title: '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbspCONTATO',
      subTitle: '<p>TELEFONE:<br>(71)999957962 <br/> <br>E-MAIL: suporte@interakt.com.br</p><br><br> Equipe Smart Security.',    
 
      buttons: [
        {
          text: 'Voltar',
          handler: (data: any) => {
            console.log('Cancel clicked');
          }
        },
        
      ]
    });

    alert.present();
  }

  alarmToggleChanged(e) {
    this.db.database.ref('users/' + this.afAuth.auth.currentUser.uid).once("value").then((snapshot) => {
      const cars = (snapshot.val() && snapshot.val().cars);
      var imei = null;
      Object.keys(cars).map((key) => {
        imei = cars[key].Imei;
      });

      const messasge = "Para proceder com a ativação do alarme certifique-se que seu veículo encontra-se desligado e com as portas fechadas. Você confirma?";
      if(this.alarmToggle) {
        this.dialogs.confirm(messasge, 'Confirmação', ["Ok", "Cancelar"]).then((value) => {
          if(value === 1) {
            this.devicesList(imei);
          } else {
            this.alarmToggle = false;
          }
        })
      } else {
        this.devicesList(imei);
      }

      
    });
  }

  devicesList(imei : string) {
    axios({
      method: 'GET',
      url: this.config.api.urls.baseUrl + "/devices",
      auth: {
        username: this.config.api.auth.user,
        password: this.config.api.auth.password
      }
    }).then((info) => {
      this.devicesListSuccess(info.data, imei);    
    }).catch((e) => {
      console.log(e);
    });
  }

  devicesListSuccess(data: any, imei : string) {
    var userTraccar = null;
    for(var i = 0; i < data.length; i++) {
      if(data[i].uniqueId == imei) {
        userTraccar = data[i];
        break;
      }
    }

    if(!userTraccar) {
      this.dialogs.alert("Nenhum usuário foi encontrado para o seu UID, por favor contacte o suporte", "Ops!!!");
      return;
    }

    axios({
      method: 'POST',
      url: this.config.api.urls.baseUrl + "/commands/send",
      auth: {
        username: this.config.api.auth.user,
        password: this.config.api.auth.password
      },
      data: this.alarmToggle ? this.getAlarmArmObj(userTraccar.id) : this.getAlarmDisarmObj(userTraccar.id)
    }).then((info) => {
      switch(info.status) {
        case 200:
          this.dialogs.alert("Comando enviado com sucesso!", "Sucesso");
          break;
        case 202:
          this.alarmToggle = !this.alarmToggle;
          this.dialogs.alert("Comando não enviado! Favor ligar e desligar veículo para reenviar o comando.", "Ops!!!")
          break;
        case 404:
          this.alarmToggle = !this.alarmToggle;
          this.dialogs.alert("Comando não enviado devido a erro de comunicação! Tente novamente ou contate o suporte.", "Ops!!!");
          break;
        default:
          this.alarmToggle = !this.alarmToggle;
          this.dialogs.alert("Não foi possível enviar o comando, contacte o suporte informando o seguinte erro: (" + info.status + ")", "Ops!!!");
          break;
      }
    }).catch((e) => {
      this.alarmToggle = !this.alarmToggle;
      this.dialogs.alert("Não foi possível enviar o comando, contacte o suporte", "Ops!!!");
    });;
  }

  getAlarmArmObj(deviceId: number) {
    return {
      "id": 1,
      "attributes": {},
      "deviceId": deviceId,
      "type": "alarmArm",
      "textChannel": false,
      "description": "Armar Veículo"
    };
  }

  getAlarmDisarmObj(deviceId: number) {
    return {
      "id": 2,
      "attributes": {},
      "deviceId": deviceId,
      "type": "alarmDisarm",
      "textChannel": false,
      "description": "Desarmar Veículo"
    };
  }

  sendTokenToServer(cars, token, user) {
    try {
      Object.keys(cars).map(key => {
        this.db.database.ref().child("devicesUsers").child("imei" + cars[key].Imei + "token" + token).set({
          imei: cars[key].Imei, 
          token: token,
          uid: user.uid
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
}
