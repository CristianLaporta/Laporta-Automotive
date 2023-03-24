import { Component } from '@angular/core';
import { ChiamateService } from 'src/app/service/chiamate.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
 online = false;
  mediacilce: any;
  constructor(private chiamate:ChiamateService) {}
  ngDoCheck() {this.online = this.chiamate.online}
  logout(){
    this.chiamate.logout()
  }
  get(event:any) {
    this.mediacilce = event.target.files
   var reader = new FileReader();
   reader.onload = this.handleReaderLoaded.bind(this);
   reader.readAsBinaryString(this.mediacilce[0]);
  }

  handleReaderLoaded(readerEvt:any) {
    var binaryString = readerEvt.target.result;
    this.mediacilce = btoa(binaryString);
    this.chiamate.changeimg(this.mediacilce)
 
  }
  eliminaccount(){
    this.chiamate.eliminaaccount()
  }
}

