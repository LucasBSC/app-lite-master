import { Injectable } from '@angular/core';
import axios from 'axios';

/*
  Generated class for the UsersProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TraccarProvider {

  public config: any = {
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

  getServerDateTime() : Promise<any> {
    return axios({
      method: 'GET',
      url: this.config.api.urls.baseUrl + "/data",
      auth: {
        username: this.config.api.auth.user,
        password: this.config.api.auth.password
      }
    });
  }
}
