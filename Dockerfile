FROM ubuntu:latest
USER root
WORKDIR /app
RUN apt-get update -y
RUN apt-get -y install curl gnupg
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get -y install nodejs
RUN apt install ffmpeg -y
COPY . .
RUN mkdir /app/storage/
RUN npm install
CMD ["node" , "--max-old-space-size=1024" , "."]