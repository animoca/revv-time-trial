import config from "config"
import logger from "winston"
import redis from "async-redis"

let instance;

const DefaultRedisClient = () => {
  if(!instance) {
    instance = redis.createClient(config.redis.url);
    instance.ping(logger.debug)
  }
  return instance;
}

export {DefaultRedisClient};