refer to gtihub https://gist.github.com/Anshul0305/a3cc9e792fc58c8c07a8f7f5c878985f
### Example template 1
{
  "facebook": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type":"generic",
        "elements":[
           {
            "title":"Here is your title!",
            "image_url":"https://i.imgur.com/fFxXB2m.png",
            "subtitle":"Here goes your subtitle.",
            "default_action": {
              "type": "web_url",
              "url": "https://google.com",
              "webview_height_ratio": "tall"
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://facebook.com",
                "title":"Link to Facebook"
              },{
                "type":"postback",
                "title":"Some Text",
                "payload":"Some Text"
              }              
            ]      
          }
        ]
      }
    }
  }
}