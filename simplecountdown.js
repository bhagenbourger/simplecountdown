(function(){
 window.SimpleCountdown = {
   callback: null,
   callbackZero: null,
   computeTimeRemaining: function(deadline){
    var t = Date.parse(deadline) - Date.parse(new Date());
    var s = t > 0 ? Math.floor((t / 1000) % 60) : 0;
    var m = t > 0 ? Math.floor((t / 1000 / 60) % 60) : 0;
    var h = t > 0 ? Math.floor((t / (1000 * 60 * 60)) % 24) : 0;
    var d = t > 0 ? Math.floor(t / (1000 * 60 * 60 * 24)) : 0;
    return {
      'seconds': s,
      'minutes': m,
      'hours': h,
      'days': d
    };
   },
   isFinished: function(timeRemaining){
      return timeRemaining.days == 0 && timeRemaining.hours == 0 && timeRemaining.minutes == 0 && timeRemaining.seconds == 0;
   },
   encodeBase64: function(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    const binaryString = String.fromCharCode.apply(null, utf8Bytes);
    return btoa(binaryString);
   },
   decodeBase64: function(str) {
    const binaryString = atob(str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
   },
   generateUrl: function(urlPath, deadline, autoUpdateDeadline, theme, title) {
    const data = {
      d: deadline,
      a: autoUpdateDeadline,
      h: theme,
      t: title ? title.substring(0, 256) : title
    };
    const jsonString = JSON.stringify(data);
    const encodedString = this.encodeBase64(jsonString);
    const url = new URL(window.location.href);
    url.pathname = urlPath;
    url.searchParams.set('d', encodedString);
    return url.toString();
   },
   getDataFromUrl: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const data = decodeURIComponent(urlParams.get('d'));
    const decodedString = this.decodeBase64(data);
    return JSON.parse(decodedString);
   },
   themes: {
     raw: {
       content: {
         title: "My countdown"
       },
       style: {
         container: ".sc-container{}",
         title: ".sc-title{}",
         brick:
           ".sc-brick{" +
    	     "padding: 10px;" +
    	     "display:inline-block;" +
           "}",
         number: ".sc-number{}",
         legend:
           ".sc-legend{" +
    	    "display: block;" +
           "}"
       }
     }
   },
   addTheme: function (newTheme, afterCallback, callbackZero) {
     for (p in newTheme) {
       if (newTheme.hasOwnProperty(p)) {
         this.themes[p] = newTheme[p];
       }
     }
     if(afterCallback){
         this.callback = afterCallback;
     }
     if(callbackZero){
         this.callbackZero = callbackZero; 
     }
   },
   loadCSS: function(theme){
    var cssDiv = document.createElement('div');
    cssDiv.innerHTML = '<style>' +
      this.themes[theme].style.title +
      this.themes[theme].style.container +
      this.themes[theme].style.brick +
      this.themes[theme].style.number +
      this.themes[theme].style.legend +
      (this.themes[theme].style.custom || "") +
      '</style>';
    document.getElementsByTagName('head')[0].appendChild(cssDiv.childNodes[0]);
   },
   display: function(container, deadline, theme, title, refresh){
    theme = theme ? theme : "raw";
    if(!refresh){
    	this.loadCSS(theme);
    }
    var t = this.computeTimeRemaining(deadline);
    if(!refresh){
    	document.getElementById(container).className += " sc-container";
      document.getElementById(container).innerHTML =
        '<div id="sc-title" class="sc-title"></div>' +
        '<div id="sc-countdown"></div>' +
        '<div id="sc-custom" class="sc-custom"></div>';
      document.getElementById("sc-title").textContent = (title || this.themes[theme].content.title);
      document.getElementById("sc-custom").textContent = (this.themes[theme].content.custom || "");
	  }
    document.getElementById("sc-countdown").innerHTML =
      '<div class="sc-brick"><span class="sc-number">' + t.days + '</span><span class="sc-legend">Days</span></div>' +
      '<div class="sc-brick"><span class="sc-number">' + t.hours + '</span><span class="sc-legend">Hours</span></div>' +
      '<div class="sc-brick"><span class="sc-number">' + t.minutes + '</span><span class="sc-legend">Minutes</span></div>' +
      '<div class="sc-brick"><span class="sc-number">' + t.seconds + '</span><span class="sc-legend">Seconds</span></div>';
    if(!refresh && this.callback){
      this.callback();
    }
    if(this.isFinished(t)){
      this.callbackZero();
    }
   },
   autoUpdate(deadline){
    var updatedDeadline = new Date(deadline);
    updatedDeadline.setFullYear(new Date().getFullYear());
    if(new Date() > updatedDeadline){
      updatedDeadline.setFullYear(updatedDeadline.getFullYear() + 1);
    }
    return updatedDeadline;
   },
   autoDisplay: function(container, deadline, autoUpdateDeadline, theme, title){
    if(autoUpdateDeadline){
      deadline = this.autoUpdate(deadline);
    }
    this.display(container, deadline, theme, title, false);
    setInterval(function(){SimpleCountdown.display(container, deadline, theme, title, true);}, 1000);
   },
   autoDisplayFromUrl: function(container){
    try{
      const data = this.getDataFromUrl();
      this.autoDisplay(
        container,
        data.d,
        data.a,
        data.h,
        data.t
      );
    } catch (e) {
      console.error("Invalid parameters from url:", e);
      document.getElementById(container).innerHTML = 
        "Invalid parameters from URL.<br />We are not able to display your countdown.<br />Please check and try again.";
    }
   }
 };
})();
