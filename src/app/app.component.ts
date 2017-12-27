import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
// import { NavController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController } from 'ionic-angular';
import { PagamentoPage } from '../pages/pagamento/pagamento';
import { ContatoPage } from '../pages/contato/contato';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{title: string, component: any, icon?: string}>;

  constructor(
    private afAuth: AngularFireAuth,
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public Alert: AlertController
  ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Tela Inicial', component: HomePage, icon: 'home' },
      { title: 'Histórico', component: ListPage, icon: 'pin' },
      { title: 'Pagamento', component: PagamentoPage, icon: 'cash' },
	  { title: 'Contato', component:ContatoPage, icon: 'people' },
     
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
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
}
