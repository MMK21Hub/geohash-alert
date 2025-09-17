# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY backend/package.json /temp/dev/backend/package.json
COPY frontend/package.json /temp/dev/frontend/package.json
COPY geohashing/package.json /temp/dev/geohashing/package.json
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY backend/package.json /temp/prod/backend/package.json
COPY frontend/package.json /temp/prod/frontend/package.json
COPY geohashing/package.json /temp/prod/geohashing/package.json
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN cd frontend && bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/backend/src ./backend/src
COPY --from=prerelease /usr/src/app/backend/package.json ./backend/package.json
COPY --from=prerelease /usr/src/app/frontend/dist ./frontend/dist
COPY --from=prerelease /usr/src/app/geohashing ./geohashing
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENV FRONTEND_DIST=/usr/src/app/frontend/dist
ENTRYPOINT [ "bun", "run", "backend/src/index.ts" ]
