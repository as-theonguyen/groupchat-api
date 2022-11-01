export default () => ({
  env: process.env.NODE_ENV!,
  port: parseInt(process.env.PORT!, 10) || 4000,
  corsOrigin: process.env.CORS_ORIGIN!,
  jwtSecret: process.env.JWT_SECRET!,
  redis: {
    url: process.env.REDIS_URL!,
  },
});
