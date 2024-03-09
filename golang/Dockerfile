FROM --platform=linux/amd64 golang:alpine3.19 as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM --platform=linux/amd64 scratch as runner
WORKDIR /app
COPY --from=builder /app/app .

EXPOSE $PORT
ENTRYPOINT [ "/app/app" ]
