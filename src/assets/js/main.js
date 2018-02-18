//TODO - move functions somewhere else
function _splitPair(p){
  var ret = [];
  if (typeof p.Pair == "undefined"){
    ret.push(_process(p));
  } else {
    ret.push(_process(p.Pair[0][0]));
    var ss = _splitPair(p.Pair[0][1]);
    ret = ret.concat(ss);
  }
  return ret;
}
function _process(p){
  if (typeof p.Pair != "undefined"){
    return _splitPair(p);
  } else if (typeof p.Map != "undefined"){
    var map = [];
    var tl = p.Map[0];
    for(var i = 0; i < tl.length; i++){
      map.push({
        key : _process(p.Map[0][i].Item[0][0]),
        value : _process(p.Map[0][i].Item[0][1])
      });
    }
    return map;
  } else if (typeof p.List != "undefined"){
    var list = [];
    var tl = p.List[0];
    for(var i = 0; i < tl.length; i++){
      list.push(_process(p.List[0][i]));
    }
    return list;
  } else if (typeof p.string != "undefined"){
    return p.string;
  } else if (typeof p.int != "undefined"){
    return p.int;
  } else {
    return p;
  }
}
const Buffer = require('buffer/').Buffer,
defaultProvider = "https://tezrpc.me/api",
library = {
  bs58check : require('bs58check'),
  sodium : require('libsodium-wrappers'),
  bip39 : require('bip39'),
  pbkdf2 : require('pbkdf2'),
},
prefix = {
    tz1: new Uint8Array([6, 161, 159]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk: new Uint8Array([43, 246, 78, 7]),
    edsig: new Uint8Array([9, 245, 205, 134, 18]),
    o: new Uint8Array([5, 116]),
},
utility = {
  b58cencode : function(payload, prefix) {
      var n = new Uint8Array(prefix.length + payload.length);
      n.set(prefix);
      n.set(payload, prefix.length);
      return library.bs58check.encode(new Buffer(n, 'hex'));
  },
  b58cdecode : function(enc, prefix) {
      var n = library.bs58check.decode(enc);
      n = n.slice(prefix.length);
      return n;
  },
  buf2hex : function(buffer) {
		var byteArray = new Uint8Array(buffer), hexParts = [];
		for(var i = 0; i < byteArray.length; i++) {
			var hex = byteArray[i].toString(16);
			var paddedHex = ('00' + hex).slice(-2);
			hexParts.push(paddedHex);
		}
		return hexParts.join('');
	},
  hex2buf : function(hex){
      return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }));
  },
  hexNonce : function(length) {
    var chars = '0123456789abcedf';
    var hex = '';
    while(length--) hex += chars[(Math.random() * 16) | 0];
    return hex;
  },
  sexp2mic : function me (mi){
    mi = mi.replace(/(?:@[a-z_]+)|(?:#.*$)/mg, '')
          .replace(/\s+/g, ' ')
          .trim();
    if (mi.charAt(0) === "(") mi = mi.slice(1,-1);
    var pl = 0;
    var sopen = false;
    var escaped = false;
    var ret = {
        prim : '',
        args : []
    };
    var val = "";
    for(var i = 0; i < mi.length; i++){
      if (escaped){
        val += mi[i];
        escaped = false;
        continue;
      }
      else if ((i === (mi.length - 1) && sopen === false) || (mi[i] === " " && pl === 0 && sopen === false)){
        if (i === (mi.length - 1)) val += mi[i];
        if (val){
          if (val === parseInt(val).toString()) {
            if (!ret.prim) return {"int" : val}
            else ret.args.push({"int" : val});
          } else if (ret.prim) {
              ret.args.push(me(val));
          } else {
            ret.prim = val;
          }
          val = '';
        }
        continue;
      }
      else if (mi[i] === '"' && sopen) {
        sopen = false;  
        if (!ret.prim) return {'string':val};
        else ret.args.push({'string':val});
        val = '';
        continue;
      }
      else if (mi[i] === '"' && !sopen && pl === 0) {
        sopen = true;
        continue;
      }
      else if (mi[i] === '\\') escaped = true;
      else if (mi[i] === "(") pl++;  
      else if (mi[i] === ")") pl--;
      val += mi[i];
    }
    return ret;
  },
  mic2arr : function(p){return _splitPair(p)},
  ml2mic : function me (mi){
        var ret = [], inseq = false, seq = '', val = '', pl = 0, bl = 0, sopen = false, escaped = false;
        for(var i = 0; i < mi.length; i++){
            if (inseq) {
                if (mi[i] == "}"){
                    ret.push({
                        prim : seq.trim(),
                        args : [me(val)]
                    });
                    val = '';
                    continue;
                }
            } 
            else if (mi[i] == "{") {
                seq = val;
                val = '';
                inseq = true;
                continue;
            }
            else if (escaped){
                val += mi[i];
                escaped = false;
                continue;
            } 
            else if ((i == (mi.length - 1) && sopen == false) || (mi[i] == ";" && pl == 0 && sopen == false)){
                if (i == (mi.length - 1)) val += mi[i];
                ret.push(eztz.utility.ml2tzjson(val));
                val = '';
                continue;
            }
            else if (mi[i] == '"' && sopen) sopen = false;
            else if (mi[i] == '"' && !sopen) sopen = true;
            else if (mi[i] == '\\') escaped = true;
            else if (mi[i] == "(") pl++;  
            else if (mi[i] == ")") pl--;
            val += mi[i];
        }
        return ret;
    }
},
crypto = {
  generateMnemonic : function(){
    return library.bip39.generateMnemonic(160)
  },
  checkAddress : function(a){
    try {
      utility.b58cdecode(a, prefix.tz1);
      return true;
    } 
    catch (e){
      return false;
    }
  },
  generateKeysNoSeed : function(){
        var kp = library.sodium.crypto_sign_keypair();
        return {
            sk : utility.b58cencode(kp.privateKey, prefix.edsk),
            pk : utility.b58cencode(kp.publicKey, prefix.edpk),
            pkh : utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
        };
    },
  generateKeysSalted : function(m,p){
      var ss = Math.random().toString(36).slice(2);
      var pp = library.pbkdf2.pbkdf2Sync(p, ss, 0, 32, 'sha512').toString();
      var s = library.bip39.mnemonicToSeed(m, pp).slice(0, 32);
      var kp = library.sodium.crypto_sign_seed_keypair(s);
      return {
          mnemonic : m,
          passphrase : p,
          salt : ss,
          sk : utility.b58cencode(kp.privateKey, prefix.edsk),
          pk : utility.b58cencode(kp.publicKey, prefix.edpk),
          pkh : utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
      };
  },
  generateKeys : function(m,p){
      var s = library.bip39.mnemonicToSeed(m, p).slice(0, 32);
      var kp = library.sodium.crypto_sign_seed_keypair(s);
      return {
          mnemonic : m,
          passphrase : p,
          sk : utility.b58cencode(kp.privateKey, prefix.edsk),
          pk : utility.b58cencode(kp.publicKey, prefix.edpk),
          pkh : utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
      };
  },
  generateKeysFromSeedMulti : function(m,p,n){
      n /= (256^2);
      var s = library.bip39.mnemonicToSeed(m, library.pbkdf2.pbkdf2Sync(p, n.toString(36).slice(2), 0, 32, 'sha512').toString()).slice(0, 32);
      var kp = library.sodium.crypto_sign_seed_keypair(s);
      return {
          mnemonic : m,
          passphrase : p,
          n : n,
          sk : utility.b58cencode(kp.privateKey, prefix.edsk),
          pk : utility.b58cencode(kp.publicKey, prefix.edpk),
          pkh : utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
      };
  },
  sign : function(bytes, sk){
    var sig = library.sodium.crypto_sign_detached(utility.hex2buf(bytes), utility.b58cdecode(sk, prefix.edsk), 'uint8array');
    var edsig = utility.b58cencode(sig, prefix.edsig);
    var sbytes = bytes + utility.buf2hex(sig);
    return {
      bytes: bytes,
      sig: sig,
      edsig: edsig,
      sbytes: sbytes,
    }
  },
  verify : function(bytes, sig, pk){
    return library.sodium.crypto_sign_verify_detached(sig, utility.hex2buf(bytes), utility.b58cdecode(pk, prefix.edpk));
  },
}
node = {
  activeProvider: defaultProvider,
  async: true,
  setProvider : function(u){
    node.activeProvider = u;
  },
  resetProvider : function(){
    node.activeProvider = defaultProvider;
  },
  query :function(e, o){
    if (typeof o == 'undefined') o = {};
    return new Promise(function (resolve, reject) {
      var http = new XMLHttpRequest();
      http.open("POST", node.activeProvider + e, node.async);
      http.onload = function() {
          if(http.status == 200) {
             if (http.responseText){
                  var r = JSON.parse(http.responseText);
                  if (typeof r.error != 'undefined'){
                   reject(r.error);
                  } else {
                    if (typeof r.ok != 'undefined') r = r.ok;
                    resolve(r);
                  }
             } else {
                 reject("Empty response returned");
             }
          } else {
            reject(http.statusText);
          }
      }
      http.onerror = function() { 
        reject(http.statusText);
      }
      http.send(JSON.stringify(o));
    });
  }
},
rpc = {
  account : function(keys, amount, spendable, delegatable, delegate, fee){
    var operation = {
      "kind": "origination",
      "balance": amount.toFixed(2)*100,
      "managerPubkey": keys.pkh,
      "spendable": (typeof spendable != "undefined" ? spendable : true),
      "delegatable": (typeof delegatable != "undefined" ? delegatable : true),
      "delegate": (typeof delegate != "undefined" ? delegate : keys.pkh),
    };
    return rpc.sendOperation(operation, keys, fee);
  },
  freeAccount : function(keys){
    var head, pred_block, opbytes;
    return node.query('/blocks/head')
    .then(function(f){
      head = f;
      pred_block = head.predecessor;
      return node.query('/blocks/prevalidation/proto/helpers/forge/operations', {
          "branch": pred_block,
          "operations": [{
              "kind" : "faucet",
              "id" : keys.pkh,
              "nonce" : utility.hexNonce(32)
          }]
      });
    })
    .then(function(f){ 
      opbytes = f.operation;
      var operationHash = utility.b58cencode(library.sodium.crypto_generichash(32, utility.hex2buf(opbytes)), prefix.o);
      return node.query('/blocks/prevalidation/proto/helpers/apply_operation', {
          "pred_block": pred_block,
          "operation_hash": operationHash,
          "forged_operation": opbytes,
      });
    })
    .then(function(f){
      npkh = f.contracts[0];
      return node.query('/inject_operation', {
         "signedOperationContents" : opbytes,
      });
    })
    .then(function(f){
      return npkh
    });
  },
  getBalance : function(tz1){
    return node.query("/blocks/prevalidation/proto/context/contracts/"+tz1+"/balance");
  },
  getHead : function(){
    return node.query("/blocks/head");
  },
  call : function(e, d){
    return node.query(e, d);
  },
  sendOperation : function(operation, keys, fee){
    var head, counter, pred_block, sopbytes, returnedContracts;
    var promises = []
    promises.push(node.query('/blocks/head'));
    if (typeof fee != 'unfedined') {
      promises.push(node.query('/blocks/prevalidation/proto/context/contracts/'+keys.pkh+'/counter'));
    }
    return Promise.all(promises).then(function(f){
      head = f[0];
      pred_block = head.predecessor;
      var opOb = {
          "branch": pred_block,
          "source": keys.pkh,
          "operations": [operation]
      }
      if (typeof fee != 'unfedined') {
        counter = f[1]+1;
        opOb['fee'] = fee;
        opOb['counter'] = counter;
        opOb['public_key'] = keys.pk;
      }
      return node.query('/blocks/prevalidation/proto/helpers/forge/operations', opOb);
    })
    .then(function(f){ 
      var opbytes = f.operation;
      var signed = crypto.sign(opbytes, keys.sk);
      sopbytes = signed.sbytes;
      var oh = utility.b58cencode(library.sodium.crypto_generichash(32, utility.hex2buf(sopbytes)), prefix.o);
      return node.query('/blocks/prevalidation/proto/helpers/apply_operation', {
          "pred_block": pred_block,
          "operation_hash": oh,
          "forged_operation": opbytes,
          "signature": signed.edsig
      });
    })
    .then(function(f){
      returnedContracts = f.contracts;
      return node.query('/inject_operation', {
         "signedOperationContents" : sopbytes, 
      });
    })
    .then(function(f){
      f['contracts'] = returnedContracts;
      return f
    });
  },
  transfer : function(keys, from, to, amount, fee){
    var operation = {
      "kind" : "transaction",
      "amount" : amount.toFixed(2)*100,
      "destination" : to
    };
    return rpc.sendOperation(operation, {pk : keys.pk, pkh : from, sk : keys.sk}, fee);
  },
  originate : function(keys, amount, code, init, spendable, delegatable, delegate, fee){
    var _code = utility.ml2mic(code), script = {
      code : _code,
      storage : {
        storageType : _code.storageType,
        storage : utility.sexp2mic(init)
      }
    }, operation = {
      "kind": "origination",
      "balance": amount.toFixed(2)*100,
      "managerPubkey": keys.pkh,
      "script": script,
      "spendable": (typeof spendable != "undefined" ? spendable : false),
      "delegatable": (typeof delegatable != "undefined" ? delegatable : false),
      "delegate": (typeof delegate != "undefined" ? delegate : keys.pkh),
    };
    return rpc.sendOperation(operation, keys, fee);
  },
  setDelegate(keys, account, delegate, fee){
    var operation = {
      "kind": "delegation",
      "delegate": (typeof delegate != "undefined" ? delegate : keys.pkh),
    };
    return rpc.sendOperation(operation, {pk : keys.pk, pkh : account, sk : keys.sk}, fee);
  },
  typecheckCode(code){
    var _code = utility.ml2mic(code);
    return node.query("/blocks/head/proto/helpers/typecheck_code", _code);
  },
  typecheckData(data, type){
    var check = {
      data : utility.sexp2mic(data),
      type : utility.sexp2mic(type)
    };
    return node.query("/blocks/head/proto/helpers/typecheck_data", check);
  },
  runCode(code, amount, input, storage, trace){
    var ep = (trace ? 'trace_code' : 'run_code');
    return node.query("/blocks/head/proto/helpers/" + ep, {
      script : utility.ml2mic(code),
      amount : amount.toFixed(2)*100,
      input : utility.sexp2mic(input),
      storage : utility.sexp2mic(storage),
    });
  }
},
contract = {
  originate : function(keys, amount, code, init, spendable, delegatable, delegate){
    rpc.originate(keys, amount, code, init, spendable, delegatable, delegate);
  },
  storage : function(contract){
    return new Promise(function (resolve, reject) {
      eztz.node.query("/blocks/head/proto/context/contracts/"+contract).then(function(r){
        resolve(r.script.storage.storage);
      }).catch(function(e){
        reject(e);
      });
    });
  },
  load : function(contract){
    return eztz.node.query("/blocks/head/proto/context/contracts/"+contract);
  },
  watch : function(contract, timeout, cb){
    var storage = [];
    var ct = function(){
      eztz.node.query("/blocks/head/proto/context/contracts/"+contract).then(function(r){
        var ns = eztz.utility.mic2arr(r.script.storage);
        if (JSON.stringify(storage) != JSON.stringify(ns)){
          storage = ns;
          cb(storage);
        }
      });
    }
    ct();
    return setInterval(ct, timeout*1000);
  },
  send : function(contract, keys, amount, parameter, fee){
    return eztz.rpc.sendOperation({
      "kind": "transaction",
      "amount": amount*100,
      "destination": contract,
      "parameters": eztz.utility.sexp2mic(parameter)
    }, keys, fee);
  }
};

//Legacy (for new micheline engine)
utility.ml2tzjson = utility.sexp2mic;
utility.tzjson2arr  = utility.mic2arr;
utility.mlraw2json  = utility.ml2mic;
//Expose library
eztz = {
  library : library,
  prefix : prefix,
  utility : utility,
  crypto : crypto,
  node : node,
  rpc : rpc,
  contract : contract,
};

//Alpha only functions
eztz.alphanet = {};
eztz.alphanet.faucet = function(toAddress){
  var keys = crypto.generateKeysNoSeed();
  var head, pred_block, opbytes, npkh;
  return node.query('/blocks/head')
  .then(function(f){
    head = f;
    pred_block = head.predecessor;
    return node.query('/blocks/prevalidation/proto/helpers/forge/operations', {
        "branch": pred_block,
        "operations": [{
            "kind" : "faucet",
            "id" : keys.pkh,
            "nonce" : utility.hexNonce(32)
        }]
    });
  })
  .then(function(f){ 
    opbytes = f.operation;
    var operationHash = utility.b58cencode(library.sodium.crypto_generichash(32, utility.hex2buf(opbytes)), prefix.o);
    return node.query('/blocks/prevalidation/proto/helpers/apply_operation', {
        "pred_block": pred_block,
        "operation_hash": operationHash,
        "forged_operation": opbytes,
    });
  })
  .then(function(f){
    npkh = f.contracts[0];
    return node.query('/inject_operation', {
       "signedOperationContents" : opbytes,
    });
  })
  .then(function(f){
    return node.query('/blocks/prevalidation/proto/context/contracts/'+npkh+'/manager');
  })
  .then(function(f){
      //Transfer from free account
      keys.pkh = npkh;
      var operation = {
        "kind": "transaction",
        "amount": 10000000,
        "destination": toAddress
      };
      return rpc.sendOperation(operation, keys, 0);
  });
}
module.exports = {
  defaultProvider,
  eztz: eztz,
};
