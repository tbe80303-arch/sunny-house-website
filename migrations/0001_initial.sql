CREATE TABLE users (
 id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','teacher')),
 name TEXT, age INTEGER, learner_group TEXT, route TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sessions (
 token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL
);
CREATE TABLE drafts (
 user_id TEXT REFERENCES users(id), paper TEXT, answers TEXT NOT NULL, revision INTEGER NOT NULL,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,paper)
);
CREATE TABLE results (
 user_id TEXT REFERENCES users(id), paper TEXT, kind TEXT NOT NULL, result TEXT NOT NULL,
 review TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,paper)
);
CREATE TABLE saved_words (user_id TEXT REFERENCES users(id), word TEXT, PRIMARY KEY(user_id,word));
CREATE TABLE classes (id TEXT PRIMARY KEY, teacher TEXT REFERENCES users(id), title TEXT NOT NULL, level TEXT NOT NULL);
CREATE TABLE enrollment (class_id TEXT REFERENCES classes(id), student TEXT REFERENCES users(id), PRIMARY KEY(class_id,student));
CREATE TABLE assignments (
 id TEXT PRIMARY KEY, class_id TEXT REFERENCES classes(id), student TEXT REFERENCES users(id),
 title TEXT NOT NULL, paper TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 0,
 release_at INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE uploads (id TEXT PRIMARY KEY, assignment TEXT REFERENCES assignments(id), name TEXT NOT NULL, type TEXT NOT NULL);
CREATE TABLE leads (
 id TEXT PRIMARY KEY, payload TEXT NOT NULL, user_id TEXT REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'pending', synced INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE throttle (key TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);
CREATE INDEX sessions_expiry ON sessions(expires);
CREATE INDEX class_enrollment ON enrollment(student);
