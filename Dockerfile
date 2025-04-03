FROM node:16-alpine as builder
ENV WORKDIR /usr/src/app/
WORKDIR $WORKDIR
COPY package*.json $WORKDIR
RUN npm install --production --no-cache

# Download and configure kubectl
RUN apk add --no-cache curl && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/

FROM node:16-alpine
ENV USER node
ENV WORKDIR /home/$USER/app
WORKDIR $WORKDIR
COPY --from=builder /usr/src/app/node_modules node_modules
# Copy wizexercise.txt from the builder stage to the final image
COPY --from=builder /usr/src/app/wizexercise.txt /usr/src/app/wizexercise.txt
# Copy kubectl from the builder stage to the final image
COPY --from=builder /usr/local/bin/kubectl /usr/local/bin/kubectl
RUN chown -R $USER:$USER $WORKDIR
COPY --chown=node . $WORKDIR
ENV CYPRESS_CACHE_FOLDER=/home/$USER/.cache/Cypress
RUN npm install cross-env grunt-cli grunt --save-dev
USER $USER
EXPOSE 4000
CMD ["npm", "start"]
