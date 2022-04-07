import React, { useEffect, useState } from 'react';

function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function fetchRetry(func, args, delay, tries) {
    function onError(err) {
        let triesLeft = tries - 1;
        if (!triesLeft) {
            throw err;
        }

        return wait(delay).then(() => fetchRetry(func, args, delay, triesLeft));
    }
    return func.apply(null, args)
        .then((response) => {
            if (response) {
                return response;
            } else {
                throw `useFetch function called failed, ${func.name}`;
            }
        }).catch(onError);
}

// generic hook for fetching resource with retry and loading state
export function useFetch(func, params, retry = false) {
    const [loading, setLoading] = useState(true);        // request is being fired
    const [state, setState] = useState();

    useEffect(() => {
        let cancel = false;
        const doFetch = async () => {
            setLoading(true);
            const res = retry ? await fetchRetry(func, params, 1000, 3) : await func.apply(null, params);
            !cancel && setState(res);
            setLoading(false);
        }

        if(func && !params.some(x => x === undefined || x === null)) {
            try {
                doFetch()
            } catch(e) {
                setLoading(false);
                setState(() => {
                    throw new Error(e)
                })
            }
        };

        return () => cancel = true;
    }, [func, ...params])

    return [state, loading, setState]
}
