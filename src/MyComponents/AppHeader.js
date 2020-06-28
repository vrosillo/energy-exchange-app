import React, {Component} from 'react';

class AppHeader extends Component{
    render(){
        return (
            <div className="app-header" >
                <br/>
                <h1>Welcome to your local Exchange</h1>
                <br/>
                <p>Please make sure that you setup first your metamask account</p>
                <br/>
            </div>
        );
    }

}

export default AppHeader;