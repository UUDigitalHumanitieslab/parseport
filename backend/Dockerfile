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
RUN mkdir /src
WORKDIR /src

COPY . /src/

# Set build-time variables
ARG CONFIGURATION=production

# Expose port
EXPOSE 8000
