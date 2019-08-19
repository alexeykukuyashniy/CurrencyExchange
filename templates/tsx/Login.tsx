import * as React from 'react';
import axios from 'axios';
import store from "./Store";
import {setToken} from "./Actions";

class CELogin extends React.Component<{},{user:string,pwd:string, status:string}> {

    constructor(props: any) {
        super(props);

        this.login = this.login.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

        this.state = {
            user: "",
            pwd: "",
            status: ""
        };
    }

    isDataValid() {
        console.log('validating:', this.state);

        return this.state.user.length > 0 &&
            this.state.pwd.length > 0;
    }

    handleInputChange(event: any) {
        let name: string = event.target.attributes.getNamedItem("name").value;
        let val: string = event.target.value;
        if (name == 'user') {
            this.setState({user: val});
        } else {
            this.setState({pwd: val});
        }
    }

    login(event: any) {
        let that = this;
        let data = {
            'user': this.state.user,
            'pwd': this.state.pwd
        };
        axios.post('/doLogin', data)
            .then(function (response) {
                console.log('response: ', response);
                if (response.data == "Incorrect password") {
                    that.setState({status: response.data});
                } else {
                    that.setState({status: ""});
                    store.dispatch(setToken(response.data));
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        return (<div id="dvLogin">
                <form method="POST">
                    <table>
                        <tbody>
                        <tr>
                            <td/>
                            <td>
                                <h5>
                                    Enter Login
                                </h5>
                            </td>
                        </tr>
                        <tr>
                            <td/>
                            <td>
                                <span id="spStatus" style={{marginLeft: "1em", color: "red"}}>{this.state.status}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                User:
                            </td>
                            <td>
                                <input
                                    name='user'
                                    type="text"
                                    value={this.state.user}
                                    onChange={this.handleInputChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Password:
                            </td>
                            <td>
                                <input
                                    name='pwd'
                                    type="text"
                                    value={this.state.pwd}
                                    onChange={this.handleInputChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{textAlign:"right"}}>
                                <input type="button" onClick={this.login} value="Login" disabled={!this.isDataValid()}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        )
    }
}

export default CELogin;