FROM python:3.10-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
RUN apt update
RUN apt install -y gettext
RUN pip install gunicorn

# Copy requirements file
COPY requirements.txt /
RUN pip install --no-cache-dir -r /requirements.txt

# Set working directory
WORKDIR /src

COPY . /src/

# Create a directory for Gunicorn logs (production).
RUN mkdir -p /logs

# Expose port
EXPOSE 8000
