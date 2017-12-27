import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
@Component({
  selector: 'page-list',
  templateUrl: 'pagamento.html'
})
export class PagamentoPage {
	 constructor(
    public navCtrl: NavController,
  ) {}
  
}