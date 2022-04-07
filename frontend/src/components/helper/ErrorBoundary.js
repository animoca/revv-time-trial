import React, { Component } from 'react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: false };
    }

    static getDerivedStateFromError = (error) => {
        return {error: true};
    }

    componentDidCatch(error, errorInfo) {
        // this.setState({ error: true })
        console.error(error)
    }

    render() {
        if(this.state.error) {
            return <>
                <h4>Something went wrong...</h4>
                <a href="/">get me out of here</a>
            </> 
        }

        return this.props.children;
    }
}