bert_view
=========

Chrome Extension to have a pretty view of binary erlang term in HTTP service

This extension needs the new chrome `declarativeWebRequest` API, so you need
the last Beta or Dev version of chrome to test it.
The extension shows BERT binary :
* if the request body is base64 encoded and the content-type header is `application/x-erlang-binary64`.
* if the request body is raw erlang term binary and the content-type header is `application/x-erlang-binary`.

## Binary Erlang Term (BERT)

http://www.erlang-factory.com/upload/presentations/36/tom_preston_werner_erlectricity.pdf

## How does it run ?

The extension workflow is the following :

    wr.onRequest.addRules([{
        conditions: [new wr.RequestMatcher({resourceType: ['main_frame'],contentType: ["application/x-erlang-binary64"]})],
        actions:    [new wr.RemoveResponseHeader({name:"content-type"}),
                     new wr.AddResponseHeader({name:"content-type",value:"text/plain"}),
                     new wr.AddResponseCookie({cookie: {name:"customview",value:"bert64"}})]
    },{
        conditions: [new wr.RequestMatcher({resourceType: ['main_frame'],contentType: ["application/x-erlang-binary"]})],
        actions:    [new wr.RemoveResponseHeader({name:"content-type"}),
                     new wr.AddResponseHeader({name:"content-type",value:"image/png"}),
                     new wr.AddResponseCookie({cookie: {name:"customview",value:"bert"}})]
    },{
        conditions: [new wr.RequestMatcher({resourceType: ['main_frame'],excludeContentType: ["application/x-erlang-binary","application/x-erlang-binary64"]})],
        actions:    [new wr.RemoveResponseCookie({filter: {name:"customview"}})]
    }]);
    chrome.runtime.onMessage.addListener(function(msg,sender) {
        if(msg.bertdata) chrome.tabs.sendMessage(sender.tab.id,{bertToHtml: convertBert(msg.bertdata)});
    });

So :
* the *Background script*  use the `declarativeWebRequest` API to
  add a cookie `customview` when a request match the content-type header
* the *Content script* observes its cookie to see if it is a customview, 
  and send an Ajax request to retreive the raw request accordingly. 
* When done, it asks to the *background script* to transform this
  data sending it a message with the base64 decoded message : `msg.bertdata`
* The *Background script* process the data to convert it into
  beautiful HTML (`convertBert`), then sends to the *content script* a message with
  the processed HTML.
* The *Content script* receive the message and write the processed
  HTML into the current DOM.
