DROP DATABASE IF EXISTS cryptocurrency;

CREATE DATABASE cryptocurrency;

GRANT ALL PRIVILEGES ON DATABASE cryptocurrency TO postgres;

\c cryptocurrency;

CREATE TABLE bitcoin (
  date Date PRIMARY KEY,
  price Decimal NOT NULL
);
