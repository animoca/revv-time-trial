import React, { useEffect, useState } from 'react';

export function useLocalStorage(key) {
    const [value, setValue] = useState(() => {
        const statusJson = window.localStorage.getItem(key);
        if(statusJson != null) {
          return JSON.parse(statusJson)
        }

        return statusJson;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [value])

    return [value, setValue];
}