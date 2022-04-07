import React, { Component } from 'react'
import { getUser } from '../../services/httpService';
import {logout as logoutApi } from "../../services/httpService";
import {toChecksumAddress} from "web3-utils";
const AuthContext = React.createContext();

const AuthConsumer = AuthContext.Consumer;

// const AnonymousUser = { isAuth: false };

class AuthProvider extends Component {
  state = { user: null, isLoggingIn: false, canForwardToRegister: false, initialUserLoaded: false };

  componentDidMount = async () => {
    // calls the api to acquire use session
    try {
      await this.login(getUser);
    } catch (e) {
      console.debug("User session not found");
    } finally {
      this.setState({initialUserLoaded: true});
    }
  }

  refreshUserProfile = async () => {
    try  {
      if(this.state.user) {
        const user = (await getUser())
        if(this.state.user.walletAddress == user.walletAddress) {
          this.setUser(user);
        } else {
          await this.logout();
        }
      }
    } catch (e) {
      console.error("Error updaing user object");
    }
  }

  setUser = (user) => {
    // check if the timeout is necessary
    // setTimeout(() => this.setState({ user: user }), 1000);
    if(user) {
      user.web3WalletAddress = toChecksumAddress(user.walletAddress);
    }
    this.setState({ user });
  }

  login = async (asyncFn) => {
    if (this.state.isLoggingIn) {
      throw new Error("login process is already in progress.")
    }
    try {
      this.setState({ isLoggingIn: true });
      const user = await asyncFn();
      this.setUser(user);
    } catch (e) {
      if (e.subType == "REGISTRATION_REQUIRED") {
        this.setState({ canForwardToRegister: true });
      };
      // console.log("Error with user login", e);
      throw e;
    } finally {
      this.setState({ isLoggingIn: false });
    }
  }

  logout = async () => {
    try {
      return await logoutApi();
    } catch (e) {
      console.log("Logout api failed", e);
    } finally {
      this.setState({ user: null });
    }
  }

  render() {
    return (
      <AuthContext.Provider
        value={{
          ...this.state,
          login: this.login,
          setUser : this.setUser,
          refreshUser : this.refreshUserProfile,
          logout: this.logout
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

export { AuthContext, AuthProvider, AuthConsumer };