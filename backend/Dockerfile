FROM python:3.10-bullseye

# Install dependencies
RUN apt update
RUN apt install -y gettext
RUN pip install gunicorn
COPY requirements.txt /tmp
RUN pip install -r /tmp/requirements.txt

# Change working directory
WORKDIR /data

# Expose port
EXPOSE 8000

# Set build-time variables
ARG CONFIGURATION=production

# Start Gunicorn WSGI server. 
# CMD if ["$DEVELOPMENT" = "production"]; then gunicorn -b 0.0.0.0:8000 wsgi:application --pythonpath=/private; else python /src/manage.py runserver 0.0.0.0:8000; fi

# CMD sleep infinity