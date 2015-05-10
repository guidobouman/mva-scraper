var request = require('request')
var cheerio = require('cheerio')
var mailgun = require('mailgun').Mailgun
var config = require('./config')
var secrets = require('./secrets')

var mg = new mailgun(secrets.mailgunApiKey)

request(config.scrapeUrl, function(error, response, html) {
  if(error) {
    console.error(error)
    return
  }

  var $ = cheerio.load(html)

  $('#ObjectsContainer input[type=hidden]').each(function() {
    var id = $(this).attr('id')
    if(id == 'mgmMarkerIDs'){
      return
    }

    var data = $(this).attr('value').split('~')
    var object = {
      id: data[0],
      prijs: data[16] + ': ' + data[17] + (data[15] ? ' ' + data[15] : ''),
      buurt: data[5],
      status: data[23] == '1' ? 'te koop' : data[13],
      url: data[18]
    }

    var message = [];
    message.push('buurt: ' + object.buurt);
    message.push(object.prijs);
    message.push('status: ' + object.status);
    message.push('');
    message.push(object.url);

    console.log(object)

    mg.sendText(
      'MVA Scraper <mva-scraper@mg.xiro.nl>',
      'Guido Bouman <m@guido.vc>',
      'Nieuw huis gevonden!',
      message.join("\n"),
      function(err) { err && console.log(err) }
    );
  });
})

// 00 : ID               'ReaOP1135624512',
// 01 : ?                '1',
// 02 : Lat,Lng          '52.3569568,4.79270919999999',
// 03 : Postcode         '1069DW',
// 04 : Stad             'Amsterdam',
// 05 : Wijk             'Amsterdam, Sloten/Slotervaart/Osdorp',
// 06 : Straat           'Tussen Meer',
// 07 : Huisnummer       '226',
// 08 : Toevoeging       '',
// 09 : ?                'WH',
// 10 : ?                '1',
// 11 : Type woning      'Portiekflat',
// 12 : Vol addres       'Tussen Meer 226 1069 DW Amsterdam, Sloten/Slotervaart/Osdorp ',
// 13 : Prijs of status  '<b>Koopsom</b><br/>€ 160.000 ',
// 14 : Prijs raw        '160000',
// 15 : Prijs type       'k.k.',
// 16 : Prijs beschr.    'koopsom',
// 17 : Prijs nice       '160.000',
// 18 : URL              'http://www.mva.nl/huizen/Tussen-Meer-226-1069DW-Amsterdam-ReaOP1135624512.html',
// 19 : Thumbnail        'http://media.mva.nl/MVASysteem/WONEN/ReaOP1135624512/1.jpg',
// 20 : ?                '0',
// 21 : ?                '1',
// 22 : Datum            '14/04/2015',
// 23 : Status           '1' // 1: te koop, 2: verkocht, 6: onder bod
