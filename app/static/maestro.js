function Maestro(filename){
    var self = this;
    this.ws = new WebSocket("wss://maestro.ngrok.com/baton/connect");
    var id = "";

    this.ws.onmessage = function(message){
        if(!id){
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

    this.send = function(module, call, body, callback){
        var mID = id+"-"+counter;
        if(callback){
            callbacks[mID] = callback;
        }

        this.ws.send(JSON.stringify({module:module, call:call, id:mID, body:body}));
        counter++;
    };

    this.register = function(module) {
        self[module.service] = module
    }
}

var maestro = new Maestro();

