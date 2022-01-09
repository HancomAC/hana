FROM hancomac/hana:base
EXPOSE 80

RUN addgroup execute
WORKDIR /HANA
COPY package.json yarn.lock .yarnrc.yml .versionrc .pnp.cjs .pnp.loader.mjs /HANA/
COPY .yarn/ /HANA/.yarn/
RUN yarn install
COPY tsconfig.json /HANA/
COPY res/ /HANA/res/
COPY dist/ /HANA/dist/
CMD yarn run run
