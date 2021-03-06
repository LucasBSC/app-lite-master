import { HomePage } from './../home/home';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
isActiveToggleTextPassword: Boolean = true;
  public toggleTextPassword(): void{
      this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword==true)?false:true;
  }
  public getType() {
      return this.isActiveToggleTextPassword ? 'password' : 'text';
  }

  user = {} as User;

  constructor(
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
  public Alert: AlertController,
  public events: Events
  ) { }

  ionViewWillLoad() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.navCtrl.setRoot(HomePage);
        this.events.publish("user:logged", user);
      }
    });
  }

  login(user: User) {
    this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password)
      .then(result => {
        if (result.email && result.uid) {
          this.toast.create({
            message: `Bem vindo, ${result.email}`,
            duration: 3000
          }).present();
        }
        this.navCtrl.setRoot(HomePage);
        this.events.publish("user:logged", result);
      })
      .catch(e => {
        this.toast.create({
          message: `Dados de login não encontrados`,
          duration: 3000
        }).present();
      });
  }
  doPromptContato() {
     let alert = this.Alert.create({
       title: '&nbsp &nbsp &nbsp &nbsp &nbsp CONTATO',
       subTitle: '<p><br>&nbsp &nbsp &nbsp &nbsp &nbsp 55 71 99652-0947 <br/> <br> &nbsp &nbsp  contato@interakt.com.br</p><br><br><br>&nbsp &nbsp &nbsp &nbsp &nbsp  Equipe INTERAKT.',    
  
       buttons: [
         {
           text: 'OK',
           handler: (data: any) => {
             console.log('Cancel clicked');
           }
         },
         
       ]
     });
 
     alert.present();
  }
}
