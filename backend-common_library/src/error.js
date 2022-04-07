function wrapArgs(args) {
  let realArgs = {};
  if (args.length == 1) {
    realArgs.message = args[0];
    realArgs.extraInfo = [];
  } else if (args.length > 1) {
    realArgs.message = args[0];
    realArgs.extraInfo = args.slice(1);
  } else {
    realArgs.message = "";
    realArgs.extraInfo = [];
  }
  return realArgs;
}


class InternalError extends Error {
  constructor(...args) {
    const type = "INTERNAL_ERROR";
    let { message, extraInfo } = wrapArgs(args);
    super(message);
    this.extraInfo = extraInfo;
    this.message = message;
    this.logStack = true;
    this.httpCode = 500;
    this.wsCode = 1013;
    this.type = type;
    this.subType = "UNKNOWN_ERROR";
  }

  wrapError(error) {
    if (error instanceof InternalError) {
      return error;
    } else {
      this.extraInfo = [...this.extraInfo, error.message];
      this.logStack = true;
      this.stack = error.stack;
      return this;
    }
  }

  static wrapError(error) {
    if (error instanceof InternalError) {
      return error;
    } else {
      const e = new InternalError(error.message);
      e.logLevel = "error";
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
      extraInfo: this.extraInfo,
      type: this.type,
      subType: this.subType,
      message: this.message
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
    this.logLevel = "warn";
    this.httpCode = 400;
    this.type = "BAD_INPUT";
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
    this.logLevel = "info";
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

class ApiError extends InternalError {
  constructor() {
    super(...arguments);
    this.httpCode = 500;
    this.type = "API_ERROR";
    this.subType = "API_FAILED";
  }
}

class AuthError extends InternalError {
  constructor() {
    super(...arguments);
    this.httpCode = 401;
    this.type = "AUTH_FAILED";
  }
}

class ValidationError extends BadInputError {
  constructor() {
    super(...arguments);
    this.subType = "VALIDATION_FAILED";
    this.logLevel = "warn";
  }
}

class CorsOriginNotAccepeted extends BadInputError {
  constructor(){
    super(...arguments);
    this.httpCode = 403;
    this.type = "BAD_INPUT";
    this.logLevel = "warn";
  }
}

export {
  InternalError,
  AppBootstrapError,
  UnknownApiError,
  BadInputError,
  MethodNotSupportedError,
  TimeoutError,
  CorsOriginNotAccepeted,
  ApiError,
  ValidationError,
  AuthError,
}
