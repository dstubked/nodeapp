FROM node:16-alpine
ENV WORKDIR /usr/src/app/
WORKDIR $WORKDIR
COPY package*.json $WORKDIR
RUN npm install --production --no-cache

FROM node:16-alpine
ENV USER node
ENV WORKDIR /home/$USER/app
WORKDIR $WORKDIR
COPY --from=0 /usr/src/app/node_modules node_modules
RUN chown -R $USER:$USER $WORKDIR
COPY --chown=node . $WORKDIR
RUN npm install cross-env grunt-cli -g && \
    npm install cross-env grunt --save-dev
USER $USER
EXPOSE 4000