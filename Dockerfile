FROM python:3.10-bullseye
RUN apt update
RUN apt install -y gettext

RUN pip install gunicorn
COPY ./backend/requirements.txt /tmp
RUN pip install -r /tmp/requirements.txt

WORKDIR /data

CMD gunicorn --reload -b 0.0.0.0:8000 wsgi:application --pythonpath=/private,/parseport
