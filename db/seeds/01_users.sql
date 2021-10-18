-- Users table seeds here (Example)
INSERT INTO users (name, email, password) VALUES ('Alice', 'AliceWonderland@fantasy.com', 'passowrd');
INSERT INTO users (name, email, password) VALUES ('Kira', 'KiraKnight@Actors.com', 'password');


INSERT INTO quizzes(user_id, title, isPrivate) VALUES (1, 'Basketball quiz', FALSE);
INSERT INTO quizzes(user_id, title, isPrivate) VALUES (2, 'Hockey quiz',FALSE);

INSERT INTO quiz_questions(quiz_id, question)
             VALUES (1, 'How many points is a three pointer');
INSERT INTO quiz_questions(quiz_id, question)
            VALUES (1, 'How many points is a layup');
INSERT INTO quiz_questions(quiz_id, question)
            VALUES (1, 'How many points is a half-court shot');

INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (1, 3, TRUE);
INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (1, 2, FALSE);
INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (1, 1, FALSE);

INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (2, 2, TRUE);
INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (2, 1, FALSE);
INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (2, 3, FALSE);

INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (3, 3, TRUE);
INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (3, 1, FALSE);
INSERT INTO quiz_answers(question_id, answer, isCorrect) VALUES (3, 4, FALSE);

INSERT INTO answer_attempts(answer_id, user_id) VALUES (1, 1);
INSERT INTO answer_attempts(answer_id, user_id) VALUES (2, 1);
