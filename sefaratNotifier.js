// ==UserScript==
// @name        sefaratNotifier
// @namespace   aisus
// @include     about:addons
// @include     https://ais.usvisa-info.com/*/niv/schedule/*/payment
// @version     0.1
// @grant       none
// ==/UserScript==

// Todos:
// a. We need an option menu with following functionalities:
// 1- choose earliest and latest date,
// 2- start or stop refreshing,
// 3- change notification sound and snooze,
// 4- a history of 5 previous found appointment times (whether in scope or out of scope)
//
// b. This needs a ui too of course:
// 1- have menus for above mentioned options,
// 2- provide info about time of last update, time to next refresh, time of last found appointment
// c. Check whether it works on chrome
var notifPlayer = document.createElement('AUDIO')
notifPlayer.src = 'https://dl.dropbox.com/u/7079101/coin.mp3'
notifPlayer.preload = 'auto'

//var countryCode = document.location.href.match('\/[a-z]{2}\-([a-z]{2})\/')[1]

if (!localStorage) {
  localStorage.setItem('earliestTime', Date.now())
  localStorage.setItem('latestTime', Date.now() + 30 * 24 * 60 * 60 * 1000)
  localStorage.setItem('snoozeTime', 30)
}

var date = new Date,
    weekDays = ["Sunday", "Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Saturday"],
    dateValues = weekDays[date.getDay()] + " - " + date.getHours()
      + ":" + date.getMinutes() +  ":" + date.getSeconds(),
    latestTime = localStorage.getItem(latestTime),
    earliestTime = localStorage.getItem(earliestTime),
    snoozeTime = localStorage.getItem(snoozeTime),
    timeHistory = [],
    updatedInfo = []

function notifyMe (city, time) {
  var notif = true
  if (Notification.permission !== "denied")
    Notification.requestPermission(function (permit) {
      if (permit === "granted") var notif = new Notification(city + ": " + time)
    })
  else if (Notification.permission === "granted")
    var notif = new Notification(city + ": " + time)
  if (notif) {
    notifPlayer.play()
    setTimeout(setInterval(function() {
      notifPlayer.play()
    }, snoozeTime * 1000), 2* 60 * 60 * 1000)
  }
}

var scheduleTable = $(".firstAvailableAppointment tr").map(function() {
  var parseDate = $(this).find("td:nth-child(2)").html().trim().split(/\s|,\s/)
  return {
    city: $(this).find("td:nth-child(1)").find("strong").html(),
    time: new Date(parseDate[1] + " " + parseDate[0] + ", " + parseDate[2])
  }
}).filter(function(_, i) {
  console.log(i.time < latestTime)
  if (!isNaN(i.time)) {
    timeHistory.push(i)
    if (i.time < latestTime && i.time > earliestTime) {
      console.log("It happened")
      return true
    }
  } else return false
})
console.log(scheduleTable)

if (scheduleTable.length !== 0) {
  notifyMe(scheduleTable[0].city, scheduleTable[0].time)
} else {
  var timeOut = Math.random() * ((300 - 60) + 60) * 1000
  console.log(dateValues + "-- going for reload in " + timeOut)
  setTimeout(function() {document.location.reload()}, timeOut)
}
