/**
 * Philip Crotwell
 * University of South Carolina, 2017
 * http://www.seis.sc.edu
 */

import seisplotjs from 'seisplotjs';

export { seisplotjs };

export class RingserverConnection {
  constructor(host, port) {
    this.host = host;
    this.port = (port ? port : 80);
  }

  pullId() {
    return this.pullIdRaw().then(raw -> {
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
    return this.pullStreamsRaw().then(raw -> {
      let lines = raw.split('\n');
      let out = {};
      out.accessTime = new Date();
      out.streams = [];
      for(let line of lines) {
        let vals = line.split(' ');
        out.streams.push(new StreamStat(vals[0], vals[1], vals[2]));
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
    return 'http://'+this.host+(this.port==80?'':':'+this.port);
  }

  formIDURL() {
    return this.formBaseURL()+'/id';
  }

  formStreamsURL() {
    return this.formBaseURL()+'/streams';
  }


};
