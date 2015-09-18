CREATE TABLE users (
  id bigint unsigned NOT NULL AUTO_INCREMENT,
  hash varchar(100),
  email varchar(100),
  ip varchar(15),
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  verified char(1) DEFAULT 'f',
  CONSTRAINT pk_users1 PRIMARY KEY (id)
);
CREATE UNIQUE INDEX hashes ON users (hash);