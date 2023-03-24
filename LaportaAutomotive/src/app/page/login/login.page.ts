import { Component, OnInit } from '@angular/core';
import { ChiamateService } from 'src/app/service/chiamate.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
register = false;
email: any;
password: any;
nomer:any;
emailr:any;
telefonor:any;
passwordr:any;
  constructor(private chiamate : ChiamateService) { }

  ngOnInit() {
  }
  setOpen(isOpen: boolean) {
    this.register = isOpen;
  }
  accedi(){
    if(this.email.lenght != 0 && this.password.lenght != 0 ){
      this.chiamate.logins(this.email,this.password)
    }

  }
  registrati(){
    this.chiamate.registrazione(this.nomer,this.emailr,this.telefonor,this.passwordr)
    this.register = false
  }
}
