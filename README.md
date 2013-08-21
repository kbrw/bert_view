bert_view
=========

Chrome Extension to have a pretty view of binary erlang term in HTTP service

This extension needs the new chrome `declarativeWebRequest` API, so you need
the last Beta or Dev version of chrome to test it.
Currently, the extension shows BERT binary if the request body is base64 encoded and
the content-type header is `application/x-erlang-binary64`.

## Binary Erlang Term (BERT)

http://www.erlang-factory.com/upload/presentations/36/tom_preston_werner_erlectricity.pdf

## How does it run ?

The extension workflow is the following :

    var wr = chrome.declarativeWebRequest;
    wr.onRequest.addRules([{
        conditions: [new wr.RequestMatcher({resourceType: ['main_frame'],contentType: ["application/x-erlang-binary64"]})],
        actions:    [new wr.RemoveResponseHeader({name:"content-type"}),
                     new wr.AddResponseHeader({name:"content-type",value:"text/plain"}),
                     new wr.SendMessageToExtension({message:"isbert64"})]
    }]);
    wr.onMessage.addListener(function(detail){
        if(detail.message=="isbert64") chrome.tabs.executeScript(detail.tabId, {file: "content.js"});
    });
    chrome.runtime.onMessage.addListener(function(msg,sender) {
        if(msg.bertdata) chrome.tabs.sendMessage(sender.tab.id,{bertToHtml: convertBert(msg.bertdata)});
    });

So :
* the *Background script*  use the `declarativeWebRequest` API to
  send itself a message `isbert64` when a request match the content-type header
* the *Background script* listen the `isbert64` message to load the
  content script *content.js* on the tab that have executed the request.
* the *Content script* send an Ajax request to retreive the raw
  request, when done, it sends to the *background script* a message
  with the base64 decoded message : `msg.bertdata`
* The *Background script* process the data to convert it into
  beautiful HTML (`convertBert`), then sends to the *content script* a message with
  the processed HTML.
* The *Content script* receive the message and write the processed
  HTML into the current DOM.
