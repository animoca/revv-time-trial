import {InternalError,ValidationError} from "@animocabrands/backend-common_library";


class InvalidCompositionIdError extends ValidationError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "INVALID_COMPOSITION_ID_ERROR"
  }
}
class InvalidTokenIdError extends ValidationError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "INVALID_TOKENID_ERROR"
  }
}

class InvalidSeasonError extends ValidationError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "INVALID_SEASON_ERROR"
  }
}

class CompositionGameError extends InternalError {  
  constructor() {
    super(...arguments);
    this.httpCode = 500;
    this.type = "COMPOSITION_GAME_ERROR";
    this.logLevel = "info";
  }
}


class UserCompositionNotFoundError extends CompositionGameError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "USER_COMPOSITION_NOT_FOUND"
  }
}

class ItemNotOwnedError extends CompositionGameError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "ITEM_NOT_OWNED"
  }
}

class InvalidItemTypeError extends CompositionGameError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "INVALID_ITEM_TYPE"
  }
}

class InvalidCompositionNameError extends CompositionGameError {
  constructor() {
    super(...arguments);
    this.httpCode = 400;
    this.subType = "BAD_CLIENT_REQUEST"
  }
}

class InvalidTyreTokenIdError extends CompositionGameError{
  constructor() {
      super(...arguments);
      this.httpCode = 404;
      this.subType = "INVALID_TYRE_TOKEN_ID_ERROR"
    }
}
class TyresNotOwnedError extends CompositionGameError {
  constructor() {
    super(...arguments);
    this.httpCode = 404;
    this.subType = "TYRES_NOT_OWNED_ERROR"
  }
}


export {
  CompositionGameError,
  UserCompositionNotFoundError,
  ItemNotOwnedError,
  InvalidCompositionIdError,
  InvalidTokenIdError,
  InvalidItemTypeError,
  InvalidCompositionNameError,
  InvalidTyreTokenIdError,
  TyresNotOwnedError,
  InvalidSeasonError
};