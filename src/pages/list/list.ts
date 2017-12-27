import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { UsersProvider } from '../../providers/users/users';
import { ListDetailPage } from '../list-detail/list-detail';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  items: Observable<any[]>;
  cars: Observable<any[]>;
  userCars: Array<object>;
  selected_smart_code: string;

  constructor(
    public db: AngularFireDatabase,
    public navCtrl: NavController,
    private usersProvider: UsersProvider,
    private afAuth: AngularFireAuth,
  ) {
    this.afAuth.auth.onAuthStateChanged(user => {
      var currentUser = this.usersProvider.findByUid(this.afAuth.auth.currentUser.uid);
      currentUser.subscribe(
        (users) => {
          if (!users.length) {
            return;
          }

          let userCars = users[0]['cars'];

          if (!userCars) {
            return;
          }

          this.userCars = Object.keys(userCars).map(function(userCar) {
            return {
              smart_code: userCars[userCar]['smart_code'],
              plate: userCars[userCar]['plate']
            };
          });

          if (this.userCars && this.userCars.length) {
            this.selected_smart_code = this.userCars[0]['smart_code'];
            this.onSmartCodeSelected(this.userCars[0]['smart_code']);
          }
        }
      );
    });
  }

  push(key, latitude, longitude) {
     this.navCtrl.push(ListDetailPage, {eventId: key, latitude: latitude, longitude: longitude});
  }

  onSmartCodeSelected(selectedValue: any) {
    this.items = this.db.list('/events', ref => ref.orderByChild('smart_code').equalTo(selectedValue)).valueChanges();

    // // this.db.list('/events', ref => ref.orderByChild('smart_code').equalTo(selectedValue)).valueChanges().subscribe(
    // //   changes => console.log('address has changed:', changes)
    // // );  

    // this.db.list('/events', ref => ref.orderByChild('smart_code').equalTo(selectedValue)).snapshotChanges()
    // // .map(action =>{ 
    // //   // console.log(action)
    // //   return action; 
    // // })
    // .subscribe(
    //   result =>{ 
    //     Object.keys(result).map(key=>{ 
    //       console.log(result[key]['key'], result[key], key) 
    //     })
    //   }
    // );

    // this.db.object('events').snapshotChanges().map(
    //   action =>{ const data = action.payload.toJSON(); return data; }
    // ).subscribe(result =>{ Object.keys(result).map(key=>{ 
    //     console.log(key, result[key]); 
    //   });     
    // });
  }

}
