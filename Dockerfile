FROM golang:1.25-alpine AS backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o memos ./cmd/memos

FROM node:20-alpine AS frontend
WORKDIR /app
COPY web/package*.json ./
RUN npm install
COPY web/ .
RUN npm run build

FROM alpine:latest
WORKDIR /app
COPY --from=backend /app/memos ./
COPY --from=frontend /app/dist ./dist
EXPOSE 5230
CMD ["./memos"]
