function wrapArgs(args) {
  let realArgs = {};
  if(args.length == 1) {
    realArgs.message = args[0];
    realArgs.extraInfo = [];
  } else if(args.length > 1) {
    realArgs.message = args[0];
    realArgs.extraInfo = args.slice(1);
  } else {
    realArgs.message = "";
    realArgs.extraInfo = [];
  }
  return realArgs;
}


class InternalError extends Error {
  constructor(...args){
      const type = "INTERNAL_ERROR";
      let {message, extraInfo} = wrapArgs(args);
      super(message);
      this.extraInfo = extraInfo;
      this.message = message;
      this.logStack = false;
      this.httpCode = 500;
      this.wsCode = 1013;
      this.type = type;
      this.logLevel = "error";
      this.subType = "UNKNOWN_ERROR";
  }

  wrapError(error) {
    if(error instanceof InternalError) {
      return error;
    } else {
      this.extraInfo = [...this.extraInfo, error.message];
      this.logStack = true;
      this.stack = error.stack;
      return this;
    }
  }

  static wrapError(error) {
    if(error instanceof InternalError) {
      return error;
    } else {
      const e = new InternalError(error.message);
      e.logStack = true;
      e.stack = error.stack;
      return e;
    }
  }

  static fromJSON(json) {
    const error = new InternalError(json.message || json.msg);
    error.type = json.type;
    error.subType = json.subType;
    error.httpCode = json.httpCode;
    error.extraInfo = json.extraInfo;
    return error;
  }

  toJson() {
    return {
      extraInfo : this.extraInfo,
      type : this.type,
      subType : this.subType,
      message : this.message
    };
  }
}

class AppBootstrapError extends InternalError {
  constructor() {
    super(arguments);
    this.type = "APP";
    this.subType = "BOOTSTRAP_FAILED";
  }
}
class BadInputError extends InternalError {
  constructor() {
      super(...arguments);
      this.httpCode = 400;
      this.type = "BAD_INPUT";
      this.logLevel = "warn";
  }
}

class CorsOriginNotAccepted extends BadInputError {
  constructor(){
    super(...arguments);
    this.httpCode = 400;
    this.type = "BAD_INPUT";
    this.logLevel = "warn";
  }
}

class MethodNotSupportedError extends BadInputError {
  constructor() {
      super(...arguments);
      this.httpCode = 400;
      this.subType = "UNSUPPORTED_METHOD";
  }
}

class UnknownApiError extends BadInputError {
  constructor() {
      super(...arguments);
      this.httpCode = 400;
      this.subType = "UNKNOWN_API";
  }
}

class TimeoutError extends InternalError {
  constructor() {
    super(...arguments);
    this.httpCode = 408;
    this.type = "TIMEOUT";
  }
}

class AuthError extends InternalError {
  constructor() {
    super(...arguments);
    this.httpCode = 401;
    this.logLevel = "warn";
    this.type = "AUTH_FAILED";
  }
}

class ValidationError extends BadInputError {
  constructor() {
    super(...arguments);
    this.subType = "VALIDATION_FAILED";
  }
}

class ProfanityCheckError extends BadInputError {
  constructor() {
    super(...arguments);
    this.subType = "PROFANITY_FOUND";
    this.logLevel = "warn";
  }
}
class UserAlreadyRegistered extends BadInputError {
  constructor() {
    super("User already registered.", ...arguments);
    this.subType = "USER_ALREADY_REGISTERED";
  }
}

class AddressVerificationNeeded extends AuthError {
  constructor() {
    super("Address verification Needed.", ...arguments);
    this.httpCode = 401;
    this.subType = "ADDRESS_VERIFICATION_REQUIRED";
  }
}

class UserNotFound extends AuthError {
  constructor() {
    super("User not found.", ...arguments);
    this.httpCode = 401;
    this.subType = "USER_NOT_FOUND";
  }
}

class RegistrationRequired extends UserNotFound {
  constructor() {
    super("User registraiton required.",...arguments);
    this.httpCode = 200;
    this.subType = "REGISTRATION_REQUIRED";
    this.logLevel = "info";
  }
}

class WalletAddressNotMatch extends AuthError {
  constructor() {
    super("Incorrect wallet address.", ...arguments);
    this.httpCode = 401;
    this.subType = "WALLET_ADDRESS_NOT_MATCH";
  }
}

class EmailVerificationNotFoundError extends InternalError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.type = "USER_VERIFICATION_FAILED";
    this.subType = "VERIFICATION_KEY_NOT_FOUND";
    this.logLevel = "info";
  }
}

module.exports = {
  UnknownApiError : UnknownApiError,
  BadInputError : BadInputError,
  MethodNotSupportedError : MethodNotSupportedError,
  TimeoutError : TimeoutError,
  AuthError : AuthError,
  InternalError : InternalError,
  ValidationError : ValidationError,
  ProfanityCheckError : ProfanityCheckError,
  AddressVerificationNeeded: AddressVerificationNeeded,
  UserNotFound : UserNotFound,
  WalletAddressNotMatch: WalletAddressNotMatch,
  CorsOriginNotAccepted,
  RegistrationRequired,
  UserAlreadyRegistered,
  EmailVerificationNotFoundError,
  AppBootstrapError
}
