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
COPY --from=build /app/package.json /app/build ./
EXPOSE 3000
CMD ["node", "./index.js"]
```

To produce sboms add the `--sbom=true` option to the `docker buildx build` command

```sh
# build
docker buildx build --sbom=true -t localhost:5002/test .

# verify by saving filesystem to disk and browsing the spdx files
docker buildx build --sbom=true -t localhost:5002/test -out ./image .
```

The above information can be found https://www.docker.com/blog/generate-sboms-with-buildkit/ and https://docs.docker.com/build/attestations/sbom/. Here's the method to get the sbom from an image.

## Test OCI Registry Attestations Locally

We can run an OCI registry locally to play in a sandbox.

```sh
docker run -d -p 5002:5000 --name registry distribution/distribution:edge
```

> ✋ I'm mapping the default registry port 5000 to a different port because MacOS uses port 5000

Build and push the image to your local registry

```sh
# make sure you've created the docker container builder with buildx
docker buildx create --use --name=buildkit-container --driver=docker-container

# build
docker buildx build \
	--output type=image,name=host.docker.internal:5002/test,push=true,registry.insecure=true \
	--sbom=true .
```

> ✋ The image tag uses host.docker.internal as the registry address because the build is running in a container

You should see a line in the output that looks similar: `generating sbom using docker.io/docker/buildkit-syft-scanner:stable-1`

Here are some helpful commands to interact with the sboms from the registry.

```sh
# get all sboms
docker buildx imagetools inspect localhost:5002/test --format "{{ json .SBOM }}"

# get the sbom from the final image
docker buildx imagetools inspect localhost:5002/test --format "{{ json .SBOM.SPDX }}"

# get the additional sboms
docker buildx imagetools inspect localhost:5002/test --format "{{ json .SBOM.AdditionalSPDXs }}"

# get the sbom named 'sbom-build', named as such because of the name of the stage in the Dockerfile we scanned
docker buildx imagetools inspect localhost:5002/test \
	--format '{{ range .SBOM.AdditionalSPDXs }}{{if eq .name "sbom-build"}}{{ json . }}{{ end }}{{ end }}'

# print 'sbom-build' in a human readable format: <software>@<version>
docker buildx imagetools inspect localhost:5002/test \
	--format '{{ range .SBOM.AdditionalSPDXs }}{{if eq .name "sbom-build"}}{{range .packages}}{{.name}}@{{ .versionInfo }}{{"\n"}}{{end}}{{end}}{{end}}' | sort

# really helpful to realize npm and javascript dependency culture is a dumpster :D
```
