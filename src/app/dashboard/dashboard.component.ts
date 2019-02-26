import { AfterViewInit, Component, OnInit } from '@angular/core';
import { map, switchMap, takeWhile, timeInterval, scan, filter } from 'rxjs/operators';
import { interval, Observable, never, BehaviorSubject, fromEvent, Subscription } from 'rxjs';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  clock: Observable<any>;
  subscription: Subscription;
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  diffSeconds: number;
  currentState: string = '';
  pauser = new BehaviorSubject(false);
  // pausee = true;

  // All the magic is here
  pausable = this.pauser.pipe(switchMap(paused => paused ? never() : this.clock));


  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    const waitButton = document.querySelector('.wait');
    const mouseDowns = fromEvent(waitButton, 'mousedown');

    const doubleClicks = mouseDowns.pipe(timeInterval(),
      scan<any>((acc, val) => val.interval < 300 ? acc + 1 : 0, 0),
      filter(val => val === 1)
    ).subscribe(e =>  {
      console.log('This was a double click!');
      // if (this.checkEmpty()) return;
      this.stop();
    });
  }

  start() {
    if (this.checkEmpty()) return;

    this.continue();

    const today = new Date();

    this.addHours(today, parseInt(this.hours,  10));
    this.addMinutes(today, parseInt(this.minutes,  10));
    this.addSeconds(today, parseInt(this.seconds,  10));

    this.diffSeconds = Math.round(today.getTime() / 1000) - Math.round(new Date().getTime() / 1000);
    console.log(this.diffSeconds);

    this.clock = interval(1000)
      .pipe(
        takeWhile(val => this.diffSeconds > 0),
        map(() => {
          this.diffSeconds--;
          if (this.diffSeconds <= 0) {
            this.reset();
          }
          return this.toHHMMSS();
        })
      );

    if ( this.subscription){
      this.subscription.unsubscribe();
    }

    this.subscription = this.pausable.subscribe(
      res => {
        console.log(res);
        this.hours = res.hours;
        this.minutes = res.minutes;
        this.seconds = res.seconds;
      }
    );
  }

  addHours(date, hours) {
    date.setHours(date.getHours() + hours);
  }

  addMinutes(date, minutes) {
    date.setMinutes(date.getMinutes() + minutes);
  }

  addSeconds(date, seconds) {
    date.setSeconds(date.getSeconds() + seconds);
  }

  toHHMMSS() {
    const secNum = this.diffSeconds;
    let hours: any =  Math.floor(secNum / 3600);
    let minutes: any = Math.floor((secNum - (hours * 3600)) / 60);
    let seconds: any = secNum - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = `0${hours}`; }
    if (minutes < 10) { minutes = `0${minutes}`; }
    if (seconds < 10) { seconds = `0${seconds}`; }
    return {
      hours, minutes, seconds
    };
  }

  checkEmpty() {
    return (!this.hours || this.hours === '00') &&
      (!this.minutes || this.minutes === '00') &&
      (!this.seconds || this.seconds === '00');
  }

  stop() {
    this.pauser.next(true);
    this.currentState = 'stop';

  }

  continue() {
    this.pauser.next(false);
    this.currentState = 'start';
  }

  reset() {
    this.currentState = '';
    this.diffSeconds = 0;
    this.hours = '00';
    this.minutes = '00';
    this.seconds = '00';
  }

}
