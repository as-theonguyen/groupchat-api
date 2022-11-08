export default () => ({
  env: process.env.NODE_ENV!,
  port: parseInt(process.env.PORT!, 10) || 4000,
  jwtSecret: process.env.JWT_SECRET!,
  redis: {
    url: process.env.REDIS_URL!,
  },
});
