const env = process.env;
export const nodeEnv = env.NODE_ENV || 'development';
import PgConnection from 'postgresql-easy';
// export const pg = new PgConnection({
//   user: 'ggpmgzoswemare',
//   host: 'ec2-34-206-252-187.compute-1.amazonaws.com',
//   database: 'd94f7otd3e40nn',
//   password: 'c08b7cd425e121261d35a05471cd71a0664b5e8fc45596a9b12d0814d7b12bb2',
//   port: 5432,
// });
export const postgreSqlConnection = ((env) => {
  switch (env) {
    case 'production':
      return new PgConnection({
        user: 'qpqeewthorprwt',
        host: 'ec2-34-225-82-212.compute-1.amazonaws.com',
        database: 'deqhqbb5qjs30o',
        password:
          'a51d8ed25a2ea681505830c19cafd67a3d46736cf4e8b710fe95ecfb1e295499',
        port: 5432,
      });
    case 'development':
      return new PgConnection({
        user: 'postgres',
        host: 'localhost',
        database: 'rajeshkumaran',
        password: 'password',
        port: 5432,
      });
    default:
      return {};
  }
})(nodeEnv);
export default {
  mongodbUri: 'mongodb://localhost:27017/test',
  port: env.PORT || 8080,
  host: env.HOST || '0.0.0.0',
  get serverUrl() {
    return `http://${this.host}:${this.port}`;
  },
};
