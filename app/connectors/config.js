const env = process.env;
export const nodeEnv = env.NODE_ENV || 'development';
import PgConnection from 'postgresql-easy';
export const pg = new PgConnection({
  user: 'ggpmgzoswemare',
  host: 'ec2-34-206-252-187.compute-1.amazonaws.com',
  database: 'd94f7otd3e40nn',
  password: 'c08b7cd425e121261d35a05471cd71a0664b5e8fc45596a9b12d0814d7b12bb2',
  port: 5432,
});

export default {
  mongodbUri: 'mongodb://localhost:27017/test',
  port: env.PORT || 8080,
  host: env.HOST || '0.0.0.0',
  get serverUrl() {
    return `http://${this.host}:${this.port}`;
  },
};
