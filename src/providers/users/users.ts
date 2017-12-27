import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from 'angularfire2/database'

/*
  Generated class for the UsersProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UsersProvider {

  constructor(private db: AngularFireDatabase) {
    console.log('Hello UsersProvider Provider');
  }

  addUser(data) {
    return this.db.database.ref().child('users').push(data)
  }

  // https://firebase.google.com/docs/database/web/read-and-write
  updateUser(userKey, data) {
    var updates = {}
    updates['/users/' + userKey] = data;
    return this.db.database.ref().update(updates);
  }

  addUserCar(userKey, data) {
    // @TODO verificar se realmente precisa inserir também no child cars
    var newCarKey = this.db.database.ref().child('cars').push().key;
    var updates = {}
    updates['/cars/' + newCarKey] = data;
    updates['/users/' +  userKey + '/cars/' + newCarKey] = data;
    return this.db.database.ref().update(updates);
  }

  findByUid(uid) {
    if (!uid) {
      return
    }
    return this.db.list('/users', ref => ref.orderByChild('uid').equalTo(uid).limitToFirst(1)).valueChanges()
  }

  insertUserKeyOnDevice(userKey, smartCode) {
    var device = this.db.database.ref(`/devicesUsers/${smartCode}/users`).once('value');
    device.then(results => {
      if (results.val()) {
        var foundUserKeys = results.val()
        for (var uk in foundUserKeys) {
          if (foundUserKeys[uk] == userKey) {  
            return false;
          }
        }

        this.db.database.ref(`/devicesUsers/${smartCode}/users/`).push(userKey);
      }
    })    
  }

  insertPushNotificationToken(uid, token) {
    if (!uid || !token) {
      return;
    }
    
    var userKey = this.findByUid(uid)[0]["$key"];    

    if (!userKey) {
      return;
    }

    return this.db.database.ref('/users/' +  userKey + '/pushNotificationTokens').push(token);
  }
}
