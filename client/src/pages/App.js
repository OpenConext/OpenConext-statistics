import React from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import "./App.scss";
import ErrorDialog from "../components/ErrorDialog";
import NotFound from "../pages/NotFound";
import ServerError from "../pages/ServerError";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import {identityProviders, me, reportError, serviceProviders} from "../api";
import Live from "./Live";
import Advanced from "./Advanced";
import "../locale/en";
import "../locale/nl";
import "../locale/pt";
import Animations from "./Animations";
import {addIcons} from "../utils/IconLibrary";

addIcons();
const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

class App extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: true,
            currentUser: {},
            allServiceProviders: [],
            allIdentityProviders: [],
            identityProvidersDict: {},
            serviceProvidersDict: {},
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
            me().then(currentUser => {
                if (currentUser && currentUser.uid) {
                    this.setState({currentUser: currentUser},
                        () => {
                            if (currentUser.guest) {
                                this.setState({
                                    loading: false
                                });
                            } else {
                                Promise.all([identityProviders(), serviceProviders()]).then(res =>
                                    this.setState({
                                        loading: false,
                                        allIdentityProviders: res[0],
                                        allServiceProviders: res[1],
                                        identityProvidersDict: res[0].reduce((acc, p) => {
                                            acc[p.id] = p;
                                            return acc;
                                        }, {}),
                                        serviceProvidersDict: res[1].reduce((acc, p) => {
                                            acc[p.id] = p;
                                            return acc;
                                        }, {})
                                    })
                                )
                            }
                        });
                } else {
                    this.handleBackendDown();
                }
            }).catch(() => this.handleBackendDown());
        }
    }


    render() {
        const {
            loading, errorDialogAction, errorDialogOpen, currentUser, allIdentityProviders, allServiceProviders,
            serviceProvidersDict, identityProvidersDict
        } = this.state;
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
                        <Route exact path="/" render={() => <Redirect to="/live"/>}/>
                        <Route path="/login" render={() => <Redirect to="/live"/>}/>
                        <Route path="/redirect" render={() => <Redirect to="/live"/>}/>
                        <Route path="/live"
                               render={props => <Live serviceProviders={allServiceProviders}
                                                      identityProviders={allIdentityProviders}
                                                      serviceProvidersDict={serviceProvidersDict}
                                                      identityProvidersDict={identityProvidersDict}
                                                      user={currentUser}
                                                      {...props}/>}/>
                        {!currentUser.guest && <Route path="/system"
                                                      render={props =>
                                                          <Advanced serviceProvidersDict={serviceProvidersDict}
                                                                    identityProvidersDict={identityProvidersDict}
                                                                    user={currentUser}
                                                                    {...props}/>}/>}
                        {!currentUser.guest && <Route path="/animations"
                                                      render={props =>
                                                          <Animations serviceProvidersDict={serviceProvidersDict}
                                                                      identityProvidersDict={identityProvidersDict}
                                                                      user={currentUser}
                                                                      {...props}/>}/>}
                        <Route path="/error"
                               render={props => <ServerError {...props}/>}/>
                        <Route component={NotFound}/>
                    </Switch>
                </div>
            </Router>

        );
    }
}

export default App;
