import {InternalError,ValidationError} from "@animocabrands/backend-common_library";


class InvalidCompositionIdError extends ValidationError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "INVALID_COMPOSITION_ID_ERROR"
  }
}

class TimeTrialError extends InternalError {  
  constructor() {
    super(...arguments);
    this.httpCode = 500;
    this.type = "TIME_TRIAL_ERROR";
    this.logLevel = "info";
  }
}

class InvalidTyreTokenIdError extends TimeTrialError{
    constructor() {
        super(...arguments);
        this.httpCode = 404;
        this.subType = "INVALID_TYRE_TOKEN_ID_ERROR"
      }
}
class TyresNotOwnedError extends TimeTrialError {
    constructor() {
      super(...arguments);
      this.httpCode = 404;
      this.subType = "TYRES_NOT_OWNED_ERROR"
    }
  }

class NoDriverInCompositionError extends TimeTrialError {
    constructor() {
      super(...arguments);
      this.httpCode = 404;
      this.subType = "NO_DRIVER_IN_COMPOSITION_ERROR"
    }
  }

class NoCarInCompositionError extends TimeTrialError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "NO_CAR_IN_COMPOSITION_ERROR"
  }
}

class GameStateNotFoundError extends TimeTrialError{
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "GAME_STATE_NOT_FOUND_ERROR"
  }
}

class NotEnoughAttemptsError extends TimeTrialError{
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "NOT_ENOUGH_ATTEMPTS_ERROR"
  }
}
class LeaderboardNotFoundError extends TimeTrialError{
  constructor(name) {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "LEADERBOARD_NOT_FOUND_ERROR"
    this.message = name;
  }
}

export {InvalidCompositionIdError,
    TimeTrialError as TestLapError,
    NoCarInCompositionError,
    NoDriverInCompositionError,
    TyresNotOwnedError,
    InvalidTyreTokenIdError,
    GameStateNotFoundError,
    NotEnoughAttemptsError,
    LeaderboardNotFoundError};