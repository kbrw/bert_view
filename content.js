function collapse(evt) {
  var collapser = evt.target;
  var target = collapser.parentNode.getElementsByClassName('collapsible');
  
  if ( ! target.length ) { return; }
  
  target = target[0];

  if ( target.style.display == 'none' ) {
    var ellipsis = target.parentNode.getElementsByClassName('ellipsis')[0];
    target.parentNode.removeChild(ellipsis);
    target.style.display = '';
  } else {
    target.style.display = 'none';
    var ellipsis = document.createElement('span');
    ellipsis.className = 'ellipsis';
    ellipsis.innerHTML = ' &hellip; ';
    target.parentNode.insertBefore(ellipsis, target);
  }
  collapser.innerHTML = ( collapser.innerHTML == '-' ) ? '+' : '-';
}

function addCollapser(item) {
  if ( item.nodeName != 'LI' ) { return; }
  
  var collapser = document.createElement('div');
  collapser.className = 'collapser';
  collapser.innerHTML = '-';
  collapser.addEventListener('click', collapse, false);
  item.insertBefore(collapser, item.firstChild);
}

if(document.cookie.indexOf("customview=bert") != -1){
    /// get raw bert64 from XMLHttpRequest, ask background to parse
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    	if (this.readyState == 4) {
          chrome.runtime.sendMessage({bertdata: atob(this.responseText)});
    	}
    };
    xhr.open("GET", document.location.href, true);
    xhr.send();
    
    // write parsed html to document
    chrome.runtime.onMessage.addListener(function(msg) {
        if(msg.bertToHtml){
            document.documentElement.innerHTML = msg.bertToHtml;
            var items = document.getElementsByClassName('collapsible');
            for( var i = 0; i < items.length; i++) {
              addCollapser(items[i].parentNode);
            }
        }
    });
}
