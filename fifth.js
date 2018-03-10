<!--

var bFocus = false;
var google_conversion_id = 1063987494;
var google_conversion_language = "en";
var google_conversion_format = "3";
var google_conversion_color = "ffffff";
var google_conversion_label = "gMhCCI6oggIQptKs-wM";
var google_conversion_value = 0;

var bConversion = false;

function IPDecode(IP) {
  document.write(utf.URLdecode(IP));
}

function OnMouseOver() {
  bFocus = true;
}

function OnMouseOut() {
  bFocus = false;
}

function OnUnload() {
  if (bFocus) {
    var pageTracker = _gat._getTracker("UA-21245319-1");
    pageTracker._trackPageview("/clickad.html");
    var xhr = null;
    if (!bConversion) {
      bConversion = true;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        try {
          xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        //				xhr.open("GET","http://www.googleadservices.com/pagead/conversion.js",false);xhr.send("");eval(xhr.responseText);
        //				xhr.open("GET","http://www.googleadservices.com/pagead/conversion/1063987494/?label=gMhCCI6oggIQptKs-wM&amp;guid=ON&amp;script=0",true);
        //				xhr.send("");
        //				eval(xhr.responseText);
      }
    }

    bFocus = false;
  }
}

function AddEvent(e, callback, obj) {
  if ((obj.nodeType !== undefined && (obj.nodeType === 1 || obj.nodeType === 9)) || obj === window)
    obj.attachEvent ? obj.attachEvent('on' + e, callback) : obj.addEventListener(e, callback, false);
  return obj;
}

function BodyOnLoad() {
  var bSuccess = false;
  var nCount = 0;

  var pageTracker = _gat._getTracker("UA-21245319-1");
  pageTracker._setVar('Austria');
  var userAgent = navigator.userAgent.toLowerCase();

  browser = {
    Version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
    Safari: /webkit/.test(userAgent),
    Opera: /opera/.test(userAgent),
    IE: /msie/.test(userAgent) && !/opera/.test(userAgent),
    Mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent),
    Chrome: /chrome/.test(userAgent)
  };

  var f = document.getElementsByTagName('iframe');
  for (var i = 0; i < f.length; i++) {
    if (f[i].src.indexOf('googlesyndication.com') > -1 || f[i].src.indexOf('googleads.g.doubleclick.net') > -1) {
      if (browser.IE) {
        AddEvent('focus', OnMouseOver, f[i]);
        AddEvent('blur', OnMouseOut, f[i]);
        AddEvent('beforeunload', OnUnload, window);
      } else {
        AddEvent('mouseover', OnMouseOver, f[i]);
        AddEvent('mouseout', OnMouseOut, f[i]);
        if (browser.Opera) {
          AddEvent('unload', OnUnload, window);
        } else {
          AddEvent('beforeunload', OnUnload, window);
        }
      }
    }
  }
}

//-->
