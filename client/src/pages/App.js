import React from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import "./App.css";
import ErrorDialog from "../components/ErrorDialog";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import ServerError from "../pages/ServerError";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import {identityProviders, me, reportError, serviceProviders} from "../api";
import "../locale/en";
import "../locale/nl";
import Dummy from "./Dummy";
import Index from "./Index";
import Live from "./Live";
import ConnectedIdentityProviders from "./ConnectedIdentityProviders";
import Overview from "./Overview";
import IdentityProviders from "./IdentityProviders";
import ServiceProviders from "./ServiceProviders";
import Advanced from "./Advanced";

const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

class App extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: true,
            currentUser: {},
            allServiceProviders: [],
            allIdentityProviders: [],
            error: false,
            errorDialogOpen: false,
            errorDialogAction: () => this.setState({errorDialogOpen: false})
        };
        window.onerror = (msg, url, line, col, err) => {
            this.setState({errorDialogOpen: true});
            const info = err || {};
            const response = info.response || {};
            const error = {
                userAgent: navigator.userAgent,
                message: msg,
                url: url,
                line: line,
                col: col,
                error: info.message,
                stack: info.stack,
                targetUrl: response.url,
                status: response.status
            };
            reportError(error);
        };
    }

    handleBackendDown = () => {
        const location = window.location;
        const alreadyRetried = location.href.indexOf("guid") > -1;
        if (alreadyRetried) {
            window.location.href = `${location.protocol}//${location.hostname}${location.port ? ":" + location.port : ""}/error`;
        } else {
            //302 redirects from Shib are cached by the browser. We force a one-time reload
            const guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
            window.location.href = `${location.href}?guid=${guid}`;
        }
    };

    componentDidMount() {
        const location = window.location;
        if (location.href.indexOf("error") > -1) {
            this.setState({loading: false});
        } else {
            me().catch(() => this.handleBackendDown())
                .then(currentUser => {
                    if (currentUser && currentUser.uid) {
                        this.setState({currentUser: currentUser, loading: false},
                            () => Promise.all([identityProviders(), serviceProviders()]).then(res =>
                                this.setState({allIdentityProviders: res[0], allServiceProviders: res[1]})
                            ));
                    } else {
                        this.handleBackendDown();
                    }
                });
        }
    }


    render() {
        const {loading, errorDialogAction, errorDialogOpen, currentUser, allIdentityProviders, allServiceProviders}
            = this.state;
        if (loading) {
            return null; // render null when app is not ready yet
        }
        return (
            <Router>
                <div>
                    {currentUser && <div>
                        <Header currentUser={currentUser}/>
                        <Navigation currentUser={currentUser} {...this.props}/>
                        <ErrorDialog isOpen={errorDialogOpen}
                                     close={errorDialogAction}/>
                    </div>}
                    <Switch>
                        <Route exact path="/" render={() => <Redirect to="/index"/>}/>
                        <Route path={"/index"} component={Index}/>
                        <Route path="/live"
                               render={props => <Live serviceProviders={allServiceProviders}
                                                      identityProviders={allIdentityProviders}
                                                      user={currentUser}
                                                      {...props}/>}/>
                        <Route path="/connected-identity-providers"
                               render={props => <ConnectedIdentityProviders {...props}/>}/>
                        <ProtectedRoute path="/dashboard/overview"
                                        user={currentUser}
                                        render={props => <Overview serviceProviders={allServiceProviders}
                                                                   identityProviders={allIdentityProviders}
                                                                   {...props}/>}/>
                        <ProtectedRoute path="/dashboard/identity-providers"
                                        user={currentUser}
                                        render={props => <IdentityProviders {...props}/>}/>
                        <ProtectedRoute path="/dashboard/service-providers"
                                        user={currentUser}
                                        render={props => <ServiceProviders {...props}/>}/>
                        <ProtectedRoute path="/dashboard/advanced"
                                        user={currentUser}
                                        render={props => <Advanced {...props}/>}/>
                        <Route path="/error"
                               render={props => <ServerError {...props}/>}/>
                        <Route path="/dummy"
                               render={props => <Dummy {...props}/>}/>
                        <Route component={NotFound}/>
                    </Switch>
                </div>
            </Router>

        );
    }
}

export default App;
