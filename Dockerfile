FROM node:16-alpine as builder
ENV WORKDIR /usr/src/app/
WORKDIR $WORKDIR
COPY package*.json $WORKDIR
RUN npm install --production --no-cache

# Copy wizexercise.txt into /usr/src/app directory
COPY wizexercise.txt $WORKDIR

FROM node:16-alpine
ENV USER node
ENV WORKDIR /home/$USER/app
WORKDIR $WORKDIR
COPY --from=builder /usr/src/app/node_modules node_modules
# Copy wizexercise.txt from the builder stage to the final image
COPY --from=builder /usr/src/app/wizexercise.txt /usr/src/app/wizexercise.txt
RUN chown -R $USER:$USER $WORKDIR
COPY --chown=node . $WORKDIR
ENV CYPRESS_CACHE_FOLDER=/home/$USER/.cache/Cypress
RUN npm install cross-env grunt-cli grunt --save-dev
USER $USER
EXPOSE 4000
CMD ["npm", "start"]