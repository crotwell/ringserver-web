
console.log("in example.js");
console.log("in example.js ringserver: "+ringserver);

//var conn = new ringserver.RingserverConnection('eeyore.seis.sc.edu', 6382);
var conn = new ringserver.RingserverConnection('10.80.193.159', 6382);

var d3 = ringserver.seisplotjs.d3;

var table = 'table';

d3.select('.serverId').select(table).remove();
d3.select('.serverId').append(table);
conn.pullId().then(function(servId) {
  var tr;  
  var tbl = d3.select('.serverId').select(table);
  tr = tbl.append('tr');
  tr.append('td').text('URL:');
  tr.append('td').text(conn.formBaseURL());
  tr = tbl.append('tr');
  tr.append('td').text('Ringserver:');
  tr.append('td').text(servId.ringserverVersion);
  tr = tbl.append('tr');
  tr.append('td').text('Organization');
  tr.append('td').text(servId.serverId);
});

d3.select('.streams').select(table).remove();
d3.select('.streams').append(table);
conn.pullStreams().then(function(streamsResult) {
  d3.select('.streams').insert('p', table)
    .text('Access: '+streamsResult.accessTime.toISOString()+" Found: "+streamsResult.streams.length);
  var tbl = d3.select('.streams')
    .select(table);
  var th = tbl.append('tr');
  th.append('th').text('Stream');
  th.append('th').text('Start');
  th.append('th').text('End');
  th.append('th').text('Latency');
  var streamList = tbl
    .selectAll('tr')
    .data(streamsResult.streams);

  var tr = streamList.enter()
    .append('tr');

  tr.append('td')
    .text(function(d) { return d.key; });

  tr.append('td')
    .text(function(d) { return d.start.toISOString(); });

  tr.append('td')
    .text(function(d) { return d.end.toISOString(); });

  tr.append('td')
    .text(function(d) { return d.calcLatency(streamsResult.accessTime); });

  streamList.exit()
    .remove();
});


