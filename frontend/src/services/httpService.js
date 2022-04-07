const REQUEST_SETTINGS = {
    method: "POST",
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'include', // include, *same-origin, omit
    headers: {
        'Content-Type': 'application/json'
    }
};


// TODO the API needs to enable CORS requests 
export const ping = async _ => {
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/ping`);
    const json = await res.json();
    return json;
}

export const getUser = async payload => {
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/api`, {
        method: "POST",
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
       body: JSON.stringify(payload),
    });
    const json = await res.json();
    if(res.status != 200 || json.error != null) {
        throw wrapError(json);
    }
    return json;
}

export const logout = async () => {
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/api/logout`, {
        method: "POST",
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
       body: "{}",
    });

    if(res.status != 200 || res.error != null) {
        throw wrapError(res);
    }
    return res;
}

export const verifyAddress = async (address, message, signature, walletProvider) => {
    const payload = {
        walletProvider,
        walletAddress: address,
        data : message,
        sig : signature
    }
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/addressVerification`, {
       ...REQUEST_SETTINGS,
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if(res.status != 200 || json.error != null) {
        throw wrapError(json);
    }

    return json;
}

const wrapError = (json) => {
    const errorObj = json.error || {"type" : "UNKNOWN", "subType" : "UNKNOWN", "message" : "Unknown Error"};
    const e =  new Error(errorObj.message);
    e.type = errorObj.type;
    e.subType = errorObj.subType;
    return e;
}

export const register = async payload => {
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/registration`,{
            ...REQUEST_SETTINGS,
            body: JSON.stringify(payload),
    });
    const json = await res.json();
    if(res.status != 201 || json.error != null) {
        throw wrapError(json);
    }
    return json;
}

export const updateUserProfile = async (nickname) => {
    if(!nickname || !nickname.length) {
        throw 'nickname cannot be blank!';
    }

    const payload = {
        nickname : nickname
    }
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/api/user`,{
            ...REQUEST_SETTINGS,
            method : "PUT",
            body: JSON.stringify(payload),
    });
    const json = await res.json();
    if(res.status != 200 || json.error != null) {
        throw wrapError(json);
    }
    return json;
}

export const resendEmailVerification = async () => {
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/emailVerification/resend`,{
            ...REQUEST_SETTINGS,
            body: "{}",
    });
    const json = await res.json();
    if(res.status != 200 || json.error != null) {
        throw wrapError(json);
    }
    return json;
}


export const emailVerification = async (verificationCode) => {
    return await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/emailVerification/verify/${verificationCode}`,
        {
            method: "GET",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include'
        }
    );
}

export const profanityCheck = async text => {
    const res = await fetch(`${process.env.REACT_APP_USER_API_BASE_URL}/profanityCheck?text=${text}`, {
        method: 'GET',
    });
    const json = await res.json();
    if(res.status != 200 || json.error != null) {
        throw wrapError(json);
    }
    return json;
}
