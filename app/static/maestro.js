function Maestro(filename) {
    var self = this;
    this.ws = new WebSocket("wss://maestro.ngrok.com/baton/connect");
    var id = "";

    this.ws.onmessage = function(message) {
        if(!id) {
            id = message.data;
            return;
        }

        var data = JSON.parse(message.data);
        if(callbacks[data.id]) {
            callbacks[data.id](data.body);
            return;
        }

        if(self[data.module]) {
            self[data.module].process(data);
        } else{
            console.error("Module: " + data.module + " does not exist.");
        }
    };

    var callbacks = {};
    var counter = 0;

    this.send = function(module, call, body, callback) {
        var mID = id+"-"+counter;
        if(callback){
            callbacks[mID] = callback;
        }

        this.ws.send(JSON.stringify({module: module, call: call, id: mID, body: body}));
        counter++;
    };

    this.register = function(module) {
        self[module.service] = module;
    }
}

function Phone() {
    this.number = '+1-201-669-4352';
    this.service = "Twilio";

    maestro.register(this);
}

Phone.prototype.sendSMS = function(to, message) {
    maestro.send(this.service, "send-sms", {to: to, from: this.number, body: message});
}

Phone.prototype.callAndSay = function(to, speech) {
    var twiml = new TwiML();
    twiml.pause(2);
    twiml.say(speech);

    this.call(to, twiml)
}

Phone.prototype.callAndPlay = function(to, url) {
    var twiml = new TwiML();
    twiml.pause(2);
    twiml.play(url);

    this.call(to, twiml);
}

Phone.prototype.call = function(to, twiml) {
    var content = twiml;
    if (twiml instanceof TwiML) {
        content = twiml.getText();
    }

    maestro.send(this.service, "send-call", {to: to, from: this.number, twiml: content})
}

Phone.prototype.process = function(e) {
    console.log(e);
}

TwiML = function() {
    this.content = "";
}

TwiML.prototype.say = function(text) {
    this.inner += "<Say>"+text+"</Say>";

    return this;
}

TwiML.prototype.play = function(url) {
    this.inner += "<Play>"+url+"</Play>";

    return this;
}

TwiML.prototype.pause = function(time) {
    time = time || 1;
    this.inner += "<Pause length=\"" + time + "\"/>";

    return this;
}

TwiML.prototype.render = function() {
    return this.inner;
}

var maestro = new Maestro();
var phone = new Phone(); 
