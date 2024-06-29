use firstdatabase;

create table if not exists users (
	id varchar(100) primary key comment '로그인 아이디',
    name varchar(100) comment 'user 이름',
    age smallint unsigned not null comment '나이 입력',
    password varchar(300) not null comment '로그인 암호'
);

select * from users;