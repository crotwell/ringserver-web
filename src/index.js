/**
 * Philip Crotwell
 * University of South Carolina, 2017
 * http://www.seis.sc.edu
 */

import * as seisplotjs from 'seisplotjs';
import RSVP from 'rsvp';
import moment from 'moment';

export { seisplotjs };

export const IRIS_HOST = 'rtserve.iris.washington.edu';

const ORG = 'Organization: ';

export class RingserverConnection {
  constructor(host, port) {
    this._host = (host ? host : IRIS_HOST);
    this._port = (port ? port : 80);
  }

  host(value) {
    return arguments.length ? (this._host = value, this) : this._host;
  }

  port(value) {
    return arguments.length ? (this._port = value, this) : this._port;
  }


  /** Pulls id result from ringserver /id parsed into an object with
    * 'ringserverVersion' and 'serverId' fields. 
    * Result returned is an RSVP Promise.
    */
  pullId() {
    return this.pullIdRaw().then(raw => {
      let lines = raw.split('\n');
      let organization = lines[1];
      if (organization.startsWith(ORG)) {
        organization = organization.substring(ORG.length);
      }
      return {
        'ringserverVersion': lines[0],
        'serverId': organization
      };
    });
  }

  /** Pulls raw result from ringserver /id. 
    * Result returned is an RSVP Promise.
    */
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
          console.log("Handle /id: "+mythis.host()+" "+this.status);
          if (this.status === 200) { resolve(this.response); }
          else {
            console.log("Reject version: "+mythis.host()+" "+this.status);reject
(this); }
        }
      }
    });
    return promise;
  }

  /** 
   *  Use numeric level (1-6) to pull just IDs from ringserver. 
   *  In a default ringserver,
   *  level=1 would return all networks like
   *  CO
   *  and level=2 would return all stations like 
   *  CO_JSC
   *  If level is falsy/missing, level=6 is used.
    * Result returned is an RSVP Promise.
   */
  pullStreamIds(level) {
    let queryParams = 'level=6';
    if (level && level > 0) { queryParams = 'level='+level; }
    return this.pullStreamsRaw(queryParams).then(raw => {
      return raw.split('\n');
    });
  }

  /** 
    * Pull streamd, including start and end times, from the ringserver.
    * The optional matchPattern is a regular expression, so for example
    * '.+_JSC_00_HH.' would get all HH? channels from any station name JSC.
    * Result returned is an RSVP Promise.
    */
  pullStreams(matchPattern) {
    let queryParams = null;
    if (matchPattern) { queryParams = 'match='+matchPattern; }
    return this.pullStreamsRaw(queryParams).then(raw => {
      let lines = raw.split('\n');
      let out = {};
      out.accessTime = moment().utc();
      out.streams = [];
      for(let line of lines) {
        let vals = line.split(/\s+/);
        if (vals.length === 0) {
          // blank line, skip
          continue;
        } else if (vals.length >= 2) {
          out.streams.push(new StreamStat(vals[0], vals[1], vals[2]));
        } else {
          console.log("Bad /streams line, skipping: '"+line+"'");
        }
      }
      return out;
    });
  }

  /** Pulls raw result from ringserver /streams. QueryParams should
    * be formatted like URL query parameters, ie 'name=value&name=value'.
    * Result returned is an RSVP Promise.
    */
  pullStreamsRaw(queryParams) {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let url = mythis.formStreamsURL(queryParams);
      let client = new XMLHttpRequest();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "text/plain");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          console.log("Handle /id: "+mythis.host()+" "+this.status);
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

  formStreamsURL(queryParams) {
    return this.formBaseURL()+'/streams'+(queryParams ? '?'+queryParams : '');
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
