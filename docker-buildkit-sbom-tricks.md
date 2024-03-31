# 🐳 Docker BuildKit SBOM Tricks

By default the sbom produced from an image only includes dependencies from the final image. This can be inaccurate for some builds, like a frontend static app whose final image would only include bundled js in an nginx image. Here's an example `Dockerfile` for an SSR SvelteKit application, note the 3rd line `ARG BUILDKIT_SBOM_SCAN_STAGE=true` which tells BuildKit to produce an sbom for the stage.

```dockerfile
# Build
FROM node:18-alpine AS build
ARG BUILDKIT_SBOM_SCAN_STAGE=true
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --immutable --ignore-scripts
COPY . .
RUN yarn build

# Runtime
FROM node:18-alpine AS runtime
USER node:node
WORKDIR /app
COPY --from=build /app/package.json /app/entrypoint.js /app/build ./
EXPOSE 3000
CMD ["./entrypoint.js"]
```

To produce sboms add the --sbom=true option to the build command

```sh
# build
docker buildx build --sbom=true -t cotyhamilton/budgety .

# verify by saving filesystem to disk and browsing the spdx files
docker buildx build --sbom=true -t cotyhamilton/budgety -out ./image .
```

The above information can be found https://www.docker.com/blog/generate-sboms-with-buildkit/ and https://docs.docker.com/build/attestations/sbom/. Here's the method to get the sbom from an image.

```sh
docker buildx imagetools inspect ghcr.io/cotyhamilton/budgety:1_2023-10-03.59.1 --format "{{ json .SBOM.SPDX }}"
```

To get additional sboms, like from our build stage, and from multi-platform images, it's not as straightforward (especially for me, I have no idea what go templating is 😜). Here are some format templates:

```sh
# get all sboms
docker buildx imagetools inspect ghcr.io/cotyhamilton/budgety:1_2023-10-03.59.1 \
	--format '{{ json .SBOM }}'

# get the additional sboms of the linux/amd64 image
docker buildx imagetools inspect ghcr.io/cotyhamilton/budgety:1_2023-10-03.59.1 \
	--format '{{ json (index .SBOM "linux/amd64").AdditionalSPDXs }}'

# get the additional sbom of the linux/amd64 image that is named sbom-build
docker buildx imagetools inspect ghcr.io/cotyhamilton/budgety:1_2023-10-03.59.1 \
	--format '{{ range (index .SBOM "linux/amd64").AdditionalSPDXs }}{{if eq .name "sbom-build"}}{{ json . }}{{ end }}{{ end }}'

# print the packages in the above sbom in a human readable format (name@version)
docker buildx imagetools inspect ghcr.io/cotyhamilton/budgety:1_2023-10-03.59.1 \
	--format '{{ range (index .SBOM "linux/amd64").AdditionalSPDXs }}{{if eq .name "sbom-build"}}{{range .packages}}{{.name}}@{{ .versionInfo }}{{"\n"}}{{end}}{{end}}{{end}}'
```
