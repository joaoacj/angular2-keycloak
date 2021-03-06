/*
 * Copyright 2017 ebondu and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Keycloak} from '../services/keycloak.core.service';

declare var window: any;

/**
 * Cordova adapter for hybrid apps.
 */
export class CordovaAdapter {


    public login(options: any) {
        //let promise = Keycloak.createPromise();
        let o = 'location=no';
        if (options && options.prompt === 'none') {
            o += ',hidden=yes';
        }
        let loginUrl = Keycloak.createLoginUrl(options);

        console.info('opening login frame from cordova: ' + loginUrl);
        if (!window.cordova) {
            throw new Error('Cannot authenticate via a web browser');
        }

        if (!window.cordova.InAppBrowser) {
            throw new Error('The Apache Cordova InAppBrowser plugins was not found and are required');
        }

        let ref: any;
        //let ref = window.cordova.InAppBrowser.open(loginUrl, '_blank', o);
        //let ref = window.cordova.InAppBrowser.open(loginUrl, '_system', o);
        let completed = false;


        ref = window.cordova.InAppBrowser.open(loginUrl, '_system');
        ref.addEventListener('loadstart', function (event: any) {
            if (event.url.indexOf('http://localhost') === 0) {
                let callback = Keycloak.parseCallback(event.url);
                Keycloak.processCallback(callback);
                ref.close();
                completed = true;
            }
        });

        ref.addEventListener('loaderror', function (event: any) {
            if (!completed) {
                if (event.url.indexOf('http://localhost') === 0) {

                    let callback = Keycloak.parseCallback(event.url);
                    Keycloak.processCallback(callback);
                    ref.close();
                    completed = true;
                } else {
                    ref.close();
                }
            }
        });


    }


    public logout(options: any) {
        let cordova = window.cordova;
        let logoutUrl = Keycloak.createLogoutUrl(options);
        let ref: any;
        let error: any;


        ref = cordova.InAppBrowser.open(logoutUrl, '_system');
        ref.addEventListener('loadstart', function (event: any) {
            if (event.url.indexOf('http://localhost') === 0) {
                this.ref.close();
            }
        });

        ref.addEventListener('loaderror', function (event: any) {
            if (event.url.indexOf('http://localhost') === 0) {
                this.ref.close();
            } else {
                error = true;
                this.ref.close();
            }
        });

        ref.addEventListener('exit', function (event: any) {
            if (error) {
                //promise.setError();
            } else {
                Keycloak.clearToken({});
                //promise.setSuccess();
            }
        });

    }

    public register(options: any) {
        let registerUrl = Keycloak.createRegisterUrl({});

        window.cordova.InAppBrowser.open(registerUrl, '_system');

    }

    public accountManagement(options: any) {
        let accountUrl = Keycloak.createAccountUrl({});

        window.cordova.InAppBrowser.open(accountUrl, '_system');

    }

    public redirectUri(options: any): any {
        if (options.redirectUri) {
            return options.redirectUri;
        } else {
            return 'http://localhost';
        }
    }
}
