FROM python:3.10-bullseye
RUN apt update
RUN apt install -y gettext

RUN pip install gunicorn
COPY ./backend/requirements.txt /tmp
RUN pip install -r /tmp/requirements.txt

WORKDIR /parseport

CMD gunicorn --reload -b 0.0.0.0:8000 parseport.wsgi:application
