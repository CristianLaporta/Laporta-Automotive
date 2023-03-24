import { Component } from '@angular/core';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@capacitor/splash-screen';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() { }


  async ngOnInit() {

    await SplashScreen.show({
      showDuration: 4000,
      autoHide: true,
    });
  }

}
