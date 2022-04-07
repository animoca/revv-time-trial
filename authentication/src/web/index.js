

(function ( $ ) {

    const api = "http://localhost:3000/user";
 
    $.fn.metamaskify = function( options ) {
 
        var settings = $.extend({
            metamaskInstallImage: "/wp-includes/images/download-metamask.png",
            network: {
                RpcUrl: "https://btbt-staging.animoca.com",
                NetworkId: "36839"
            }

        }, options );

        $content = this;


        if(!settings.network) {
            console.error("RPC network is not defined.");
            return this;
        } 

        var callApi = (method, data) => {
            jQuery.post(
                {
                    url: api + "/" + method,
                    data: data,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    success: (result) => {
                        console.log(result);
                    }
                }
            )
        }

        var sign = (from, text, handler) => {
            var enc = new TextEncoder();
            var buffer = enc.encode(text);
            var msg = "0x" + Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
        
            var params = [msg, from]
            var method = 'personal_sign'
        
            web3.currentProvider.sendAsync({
                method,
                params,
                from
            }, (err, result) => {
                if (err) return console.error(err)
                if (result.error) return console.error(result.error)
                handler(result.result, msg, from);
            });
        }

        var login = (e) => {
            
            e.preventDefault();
            var text = "Terms of Use:  Login";
            
            sign(e.data.walletAddress, text, (result, msg, from) => {
                callApi(
                    "login",
                    {
                        from: from,
                        result: result,
                        msg: msg
                    }
                )
            })
        }

        var register = (e) => {
            e.preventDefault();
            var text = "Terms of Use:  Registering";
            $form = $(e.target).closest('form');
            sign(e.data.walletAddress, text, (result, msg, from) => {
                

                
                callApi(
                    "register",
                    $.param({
                        from: from,
                        result: result,
                        msg: msg
                    }) + "&" + $form.serialize()
                )
            })

        }
      
        var render = () => {
            web3.version.getNetwork((err, networkId) => {
                web3.eth.getAccounts((err, accounts) => {
                    if (window.ethereum) {
                        window.ethereum.on('accountsChanged', function (accounts) {
                            location.reload();
                        })
                        
                        window.ethereum.on('networkChanged', function (netId) {
                            location.reload();
                        })
                    } else if (window.web3) {
                        var accountInterval = setInterval(() => {
                            if (web3.eth.accounts[0] !== account) {
                                account = web3.eth.accounts[0];
                                location.reload();
                            }
                        }, 100);
                    }
                    if(settings.network["NetworkId"] === networkId){
                        if (err != null) {
                            console.log(err);
                        }
                        else if (accounts.length === 0) {
                            console.log('MetaMask is locked');
                        }
                        else {

                            $content.append('<div>Accounts: ' + accounts[0] + '</div>');
                            
                            $.ajax({
                                url: api,
                                xhrFields: {
                                    withCredentials: true
                                }
                            }).done((response) => {
                                $content.append('<div>Nickname: ' + response.data.nickname + '</div>');
                                $content.append('<div>Email: ' + response.data.email + '</div>');
                                $content.append('<div>Age: ' + response.data.age + '</div>');
                            }).fail(() => {
                                $content.append('<button type="button" class="btn btn-dark" id="personalSignButton">Login</button>');

                                $content.append(
                                    ['<form action="/register">',
                                     '<div style="padding: 4px;">NickName: <input type="text" name="nickname"/></div>',
                                     '<div style="padding: 4px;">Email: <input type="email" size="50" name="email"/></div>',
                                     '<div style="padding: 4px;">Age: <input type="email" name="age"/></div>',
                                     '<input type="submit" class="btn btn-dark" id="registerButton" value="Register" />'
                                    ].join("")
                                )
                                
    
                                $("#personalSignButton").on('click', { "account": accounts[0] }, login);
                                $("#registerButton").on('click', { "account": accounts[0] }, register);

                            })
                                
                            
                            
                        }
                    } else {
                        alert("Please switch Metamask to network: " + settings.network["RpcUrl"])
                    }
                });
                
            });
        }


        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                ethereum.enable().then(() => {
                    render();
                });
                // Acccounts now exposed
                
            } catch (error) {
                // User denied account access...
               
            }
        } else if (window.web3) {
            window.web3 = new Web3(web3.currentProvider);
            render();
            // Acccounts always exposed
            
        } else {
            $content.append('<a href="https://metamask.io/" target="_blank"><img src="' + settings.metamaskInstallImage + '" alt="Download Metamask"></a>');
        }

 
        return this;
     
 
    };
 
}( jQuery ));




$( document ).ready(function() {

    $("#user").metamaskify({});

});
