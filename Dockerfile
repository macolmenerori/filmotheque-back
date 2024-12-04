FROM node:22-alpine
LABEL app="filmotheque-back" stack.binary="node" stack.version="22-alpine"

WORKDIR /usr/app

# Dockerfile config.env* means that if no config.env file is present, Dockerfile will be copied instead
COPY Dockerfile config.env* ./
COPY src src
COPY package.json ./
COPY yarn.lock ./
COPY .eslintignore ./
COPY .eslintrc.js ./
COPY .prettierrc ./
COPY .npmrc ./
COPY tsconfig.json ./

RUN mkdir uploads

RUN yarn install --frozen-lockfile
RUN yarn build

EXPOSE 8081

HEALTHCHECK --interval=120s --retries=2 --start-period=5m --timeout=30s CMD wget -q -O- http://localhost:8081/healthcheck || exit 1

CMD ["yarn", "start"]