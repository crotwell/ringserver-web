/**
 * Philip Crotwell
 * University of South Carolina, 2017
 * http://www.seis.sc.edu
 */

import * as seisplotjs from 'seisplotjs';
import RSVP from 'rsvp';
import moment from 'moment';

export { seisplotjs };

export class RingserverConnection {
  constructor(host, port) {
    this._host = host;
    this._port = (port ? port : 80);
  }

  host(value) {
    return arguments.length ? (this._host = value, this) : this._host;
  }

  port(value) {
    return arguments.length ? (this._port = value, this) : this._port;
  }


  pullId() {
    return this.pullIdRaw().then(raw => {
      let lines = raw.split('\n');
      return {
        'ringserverVersion': lines[0],
        'serverId': lines[1]
      };
    });
  }

  pullIdRaw() {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let url = mythis.formIdURL();
      let client = new XMLHttpRequest();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "text/plain");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          console.log("handle /id: "+mythis.host()+" "+this.status);
          if (this.status === 200) { resolve(this.response); }
          else {
            console.log("Reject version: "+mythis.host()+" "+this.status);reject
(this); }
        }
      }
    });
    return promise;
  }



  pullStreams() {
    return this.pullStreamsRaw().then(raw => {
      let lines = raw.split('\n');
      let out = {};
      out.accessTime = moment().utc();
      out.streams = [];
      for(let line of lines) {
        let vals = line.split(/\s+/);
        if (vals.length === 0) {
// blank line, skip
        } else if (vals.length >= 2) {
console.log("streams push: "+vals[0]+", "+vals[1]+", "+vals[2]);
          out.streams.push(new StreamStat(vals[0], vals[1], vals[2]));
        } else {
          console.log("bad line: '"+line+"'");
        }
      }
      return out;
    });
  }

  pullStreamsRaw() {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let url = mythis.formStreamsURL();
      let client = new XMLHttpRequest();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "text/plain");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          console.log("handle /id: "+mythis.host()+" "+this.status);
          if (this.status === 200) { resolve(this.response); }
          else {
            console.log("Reject version: "+mythis.host()+" "+this.status);reject
(this); }
        }
      }
    });
    return promise;
  }

  formBaseURL() {
    return 'http://'+this.host()+(this.port()==80?'':':'+this.port());
  }

  formIdURL() {
    return this.formBaseURL()+'/id';
  }

  formStreamsURL() {
    return this.formBaseURL()+'/streams';
  }


};

export class StreamStat {
  constructor(key, start, end) {
    this.key = key;
    this.startRaw = start;
    this.endRaw = end;
    this.start = moment(start+'Z');
    this.end = moment(end+'Z');
  }
  calcLatency(accessTime) {
    return this.end.from(accessTime);
  }
};
