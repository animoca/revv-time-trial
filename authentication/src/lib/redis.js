import config from "config"
import logger from "winston"
import redis from "async-redis"


const RedisClient = redis.createClient(config.redis.url)


RedisClient.ping(logger.debug);


export {RedisClient};