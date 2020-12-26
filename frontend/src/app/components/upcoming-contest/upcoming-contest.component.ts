import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upcoming-contest',
  templateUrl: './upcoming-contest.component.html',
  styleUrls: ['./upcoming-contest.component.css']
})
export class UpcomingContestComponent implements OnInit {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  private urls = [
    'https://www.kontests.net/api/v1/sites',
    'https://www.kontests.net/api/v1/all'
  ];

  hideSpinner: boolean = false;

  sites = null;
  allData = null;
  copyAllData = null;

  constructor(private http: HttpClient, private router: Router) { }
  
  ngOnInit(): void {

    setTimeout(() => {
      this.hideSpinner = true;
    }, 1000);

    try {
      this.http.get<any>(this.urls[1]).subscribe((data) => {
        this.allData = this.copyAllData = data;
        this.sites = new Set();
        data.forEach(d => {
          this.sites.add(d.site);
        });
        // console.log(this.allData);
        // console.log(this.sites);
        
      });
    } catch (err) {
      this.router.navigate(['/error']);
    }
  }
  
  getSiteData(event) {
    console.log(event);
    
    let site = event.target.outerText;
    console.log(site);
    
    if(site === 'All') {
      this.allData = this.copyAllData;
    }
    else
    {
      this.allData = [];
      this.copyAllData.forEach(data => {
        if(data.site === site) {
          this.allData.push(data);
        }
      });
    }
  }

  filter(query: string)
  {
    query = query.toLowerCase().trim();
    let terms: string[] = query.split(' ');
  
    let searchData = [];
    this.copyAllData.forEach(b => {
      let ok: boolean = false;
      terms.forEach(term => {
        if (b.name.toLocaleLowerCase().includes(term)) {
          ok = true;
        }
      });
      if (ok) {
        searchData.push(b);
      }
    });
    this.allData = searchData;
  }

  /**
   * Returns a human readable format of date
   * @param date Date
   */
  dateToHumanReadable(date: Date) {
    date = new Date(date);
    
    let year = date.getFullYear();

    let month: any = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;

    let day: any = date.getDate();
    day = day < 10 ? `0${day}` : day;

    let hour: any = date.getHours();
    hour = hour < 10 ? `0${hour}` : hour;

    let minute: any = date.getMinutes();
    minute = minute < 10 ? `0${minute}` : minute;

    return `${day}-${month}-${year} at ${hour}:${minute}`;
  }

  /**
   * Returns string according to given duration(second)
   * @param time Time in seconds
   */
  secondToHumanReadable(sec: number) {
    let seconds: number = <number><unknown>(sec / 1).toFixed(1);
    let minutes: number = <number><unknown>(sec / (60)).toFixed(1);
    let hours: number = <number><unknown>(sec / (60 * 60)).toFixed(1);
    let days: number = <number><unknown>(sec / (60 * 60 * 24)).toFixed(1);
    let years: number = <number><unknown>(sec / (60 * 60 * 24 * 365)).toFixed(1);

    if (seconds < 60) {
      return `${seconds} Sec`;
    } else if (minutes < 60) {
      return `${minutes} Min`;
    } else if (hours < 24) {
      return `${hours} Hrs`;
    } else if (days < 365) {
      return `${days} Day`;
    } else {
      return `${years} Yrs`;
    }
  }

  /**
   * Returns google calendar link according to given data
   * @param data 
   */
  getCalendarLink(data): string {

    let normalizeDate = (date: string) => {
      return date.split('-').join('').split(':').join('').split('.').join('');
    };

    const stime = normalizeDate(data.start_time);
    const etime = normalizeDate(data.end_time);

    let res: string = 'https://calendar.google.com/event?action=TEMPLATE';
    res += `&dates=${stime}/${etime}`;
    res += `&text=${data.name.split(' ').join('%20')}`;
    res += `&location=${data.url}`;
    return res;
  }
}