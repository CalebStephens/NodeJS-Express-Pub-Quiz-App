import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, checkperiod: 310 });

const cacheRoute = (req, res, next) => {
  const key = req.originalUrl + req.headers.authorization;

  const cachedRes = cache.get(key);

  if (req.method !== "GET" && cachedRes) {
    console.log(`${key} deleted from the cache`);
    cache.del(key);
    return next();
  } else if (cachedRes) {
    console.log("Cache hit");
    return res.json(cachedRes);
  } else {
    console.log("Cache miss");
    res.originalSend = res.json;
    res.json = (body) => {
      res.originalSend(body);
      cache.set(key, body);
    };
    return next();
  }
};

export default cacheRoute;