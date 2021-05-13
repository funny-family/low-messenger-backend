// https://stackoverflow.com/questions/18538537/time-requests-in-nodejs-express/18539853

function responseTime() {
  return function (req, res, next) {
    const start = new Date();

    if (res._responseTime) return next();
    res._responseTime = true;

    res.on('header', function () {
      const duration = new Date() - start;
      res.setHeader('X-Response-Time', duration + 'ms');
    });

    next();
  };
}
