import { Component } from '@angular/core';
import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { AlertController, IonicSlides } from '@ionic/angular';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { ChiamateService } from 'src/app/service/chiamate.service';
import { DomSanitizer } from '@angular/platform-browser';
SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  stato: string | undefined;
  color: string | undefined;
  prenota = false
  online = false
  user: any;
  prenotazioni: any;
  minDate: any = new Date().toISOString();
  datepren: any;
  orepren: any;
  modelpren:any;
  problempren:any;
  constructor(private screenOrientation: ScreenOrientation, private chiamate: ChiamateService, public DomSanitizer: DomSanitizer, private alertController: AlertController) { }
  ngOnInit() {
    this.chiamate.getstato(data => { this.color = data.color, this.stato = data.stato });
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.chiamate.getuser()
  }
  ngDoCheck() { this.online = this.chiamate.online, this.user = this.chiamate.user, this.prenotazioni = this.chiamate.prenotazioni }


  setOpen(isOpen: boolean) {
    this.prenota = isOpen;

  }
  autoGrowTextZone(e:any) {
    e.target.style.height = "10px";
    e.target.style.height = (e.target.scrollHeight + 25) + "px";
  }
  updateMyDate($event:any) {
    let event = $event
    this.datepren =event.slice(0, 10) 
    this.orepren = event.slice(11, 16)
  }
  updateMyhour($event:any) {
    let event = $event
    this.orepren = event.slice(11, 16)
  }
  async prenoelAlert(id: string) {
    const alert = await this.alertController.create({
      header: 'Vuoi eliminare questa prenotazione definitivamente?',
      cssClass: 'ale',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          handler: () => {
            console.log("non eseguito")
          },
        },
        {
          text: 'Elimina',
          role: 'confirm',
          handler: () => {
            this.chiamate.eliminapreno(id)
          },

        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

  }

prenotago(){
  if(this.datepren != undefined &&this.orepren != undefined && this.modelpren != undefined && this.problempren != undefined){

    this.chiamate.prenotago(this.datepren,this.orepren,this.modelpren,this.problempren)
    this. prenota = false
  } else{
    this.chiamate.presentAlert("Compila tutti i campi prima di continuare!")
  
  }

}
}
