
# Use correct utf8bm4 encoding as uft8 searching is broken.
create database if not exists link_shortener
	character set utf8mb4 collate utf8mb4_unicode_ci;

create table if not exists link_shortener.redirects (
	redirectID int unsigned auto_increment,
	hash varchar(8) not null,
	url varchar(2033),
	primary key(redirectID),
	unique key(hash)
) character set utf8mb4 collate utf8mb4_unicode_ci;

create table if not exists link_shortener.banned (
	bannedID int unsigned auto_increment,
	url varchar(2033),
	primary key(bannedID)
) character set utf8mb4 collate utf8mb4_unicode_ci;
