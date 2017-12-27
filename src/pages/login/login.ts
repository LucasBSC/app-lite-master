import { HomePage } from './../home/home';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from '../../models/user';

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

  user = {} as User;

  constructor(
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) { }

  ionViewWillLoad() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.navCtrl.setRoot(HomePage);
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
      })
      .catch(e => {
        this.toast.create({
          message: `Dados de login não encontrados`,
          duration: 3000
        }).present();
      });
  }
}
