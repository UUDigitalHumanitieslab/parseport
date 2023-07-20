create user parseport_db_admin with createdb password 'parseport';
create database parseport;
grant all on database parseport to parseport_db_admin;
