import {AuthError} from "../error";

class UserSessionNotFound extends AuthError {
  constructor() {
    super("Address verification Needed.", ...arguments);
    this.httpCode = 401;
    this.subType = "USER_SESSION_NOT_FOUND";
  }
}

export {UserSessionNotFound};

