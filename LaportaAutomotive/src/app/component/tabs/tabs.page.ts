import { Component } from '@angular/core';
import { ChiamateService } from 'src/app/service/chiamate.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  market = false;
  annunci:any
  constructor( private chiamate: ChiamateService) { }
  ngDoCheck() { this.annunci = this.chiamate.annunci }

  setOpen(isOpen: boolean) {
    this.market = isOpen;
this.chiamate.getannunci()
  }
}
