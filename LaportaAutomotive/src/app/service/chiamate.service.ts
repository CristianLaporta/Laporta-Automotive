import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ChiamateService {
  user: any
  prenotazioni: any
  online = false
  userslog: any;
  isLoading = false;
  annunci:any;
  constructor(private http: HttpClient, private router: Router, private alertController: AlertController, private loadingController: LoadingController) { }

  getstato(after: (response: any) => void) {
    let response: any
    this.http.get('https://laportautomotive.duckdns.org:8445/stato/').subscribe(
      res => response = res,
      err => console.error(err),
      () => { }
    ).add(() => {
      if (!!after) after(response)
    })
  }
  getuser() {

    let ids = localStorage.getItem('id');
    let tokens = localStorage.getItem('token')
    if (ids != null && tokens != null) {
      let id = localStorage.getItem('id')!.replace(/"/g, '');
      let token = localStorage.getItem('token')!.replace(/"/g, '');
      this.http.post('https://laportautomotive.duckdns.org:8445/api/verifica/', { id: id, token: token }).subscribe((Response) => {
        if (Response == "logout") {
          this.logout()
        } else {
          this.user = Response;
          this.getprenotazioni(this.user.id, this.user.token)
        }
      });
    } else {
      this.logout()
    }
  }
  logout() {
    this.online = false
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    this.router.navigate(['/login']);
  }
  getprenotazioni(id: any, token: any) {
    this.http.post('https://laportautomotive.duckdns.org:8445/api/prenotazioni/', { id: id, token: token }).subscribe((Response) => {
      this.online = true;
      this.prenotazioni = Response;
    });

  }
  logins(username: any, password: any) {
    this.http.post('https://laportautomotive.duckdns.org:8445/api/login/', { username: username, password: password }).subscribe((Response) => {
      if (Response != "error") {
        this.userslog = Response
        localStorage.setItem('id', this.userslog.id)
        localStorage.setItem('token', this.userslog.token)
        this.router.navigate(['/tabs/tab1']);
        setTimeout(() => {
          this.getuser()
        }, 1000);
      } else {
        this.presentAlert("i dati inseriti sono sbagliati oppure non esiste un account con questi dati")
      }

    });

  }
  registrazione(nome: any, email: any, telefono: any, password: any) {
    let message = 'stiamo creando il tuo account...';
    this.present(message);
    this.http.post('https://laportautomotive.duckdns.org:8445/api/registrati/', { nome: nome, password: password, email: email, telefono: telefono }).subscribe((Response) => {
      if (Response != "ok") {
        this.presentAlert(Response)
      } else {
        this.dismiss();
        this.presentAlert("registrazione avvenuta con successo!")
      }

    });

  }
  async presentAlert(message: any) {
    const alert = await this.alertController.create({
      subHeader: message,
      buttons: ['OK'],
      cssClass: 'ale'
    });

    await alert.present();
  }


  eliminapreno(idpost: any) {
    let message = 'stiamo eliminando la tua prenotazione...';
    this.present(message);
    let id = localStorage.getItem('id')!.replace(/"/g, '');
    let token = localStorage.getItem('token')!.replace(/"/g, '');
    this.http.post('https://laportautomotive.duckdns.org:8445/api/removepreno/', { id: id, token: token, idpost: idpost }).subscribe((Response) => {
      this.getprenotazioni(id, token)
      this.dismiss();
    });
  }

  async present(message: any) {
    this.isLoading = true;
    return await this.loadingController
      .create({
        message: message,
        mode: 'ios',
      })
      .then((a) => {
        a.present().then(() => {
          if (!this.isLoading) {
            a.dismiss().then();
          }
        });
      });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController
      .dismiss()
      .then(() => console.log('dismissed'));
  }
  prenotago(datepren: any, orepren: any, modelpren: any, problempren: any) {
    let message = 'stiamo creando la tua prenotazione...';
    this.present(message);
    let id = localStorage.getItem('id')!.replace(/"/g, '');
    let token = localStorage.getItem('token')!.replace(/"/g, '');
    this.http.post('https://laportautomotive.duckdns.org:8445/api/createprenotazione/', { id: id, token: token, datepren: datepren, orepren: orepren, modelpren: modelpren, problempren: problempren }).subscribe((Response) => {
      this.getprenotazioni(id, token)
      this.presentAlert("Prenotazione richiesta con successo!")
      this.dismiss();
    });
  }
  getannunci() {
    let message = 'Caricamento...';
    this.present(message);
    this.http.get('https://laportautomotive.duckdns.org:8445/api/annunci/').subscribe((Response) => {
       this.annunci = Response
      this.dismiss();
    });
  }
  changeimg(img: any) {
    let message = 'stiamo cambiando la tua foto...';
    this.present(message);
    let id = localStorage.getItem('id')!.replace(/"/g, '');
    let token = localStorage.getItem('token')!.replace(/"/g, '');
    this.http.post('https://laportautomotive.duckdns.org:8445/api/changefoto/', { id: id, token: token, img: img}).subscribe((Response) => {
      this.getprenotazioni(id, token)
      this.presentAlert("Foto cambiata con successo!")
      this.getuser()
      this.dismiss();
    });
  }
  eliminaaccount() {
    let message = 'stiamo eliminando tutti i tuoi dati...';
    this.present(message);
    let id = localStorage.getItem('id')!.replace(/"/g, '');
    let token = localStorage.getItem('token')!.replace(/"/g, '');
    this.http.post('https://laportautomotive.duckdns.org:8445/api/eliminatutto/', { id: id, token: token}).subscribe((Response) => {
     this.logout()
      this.dismiss();
    });
  }
}
