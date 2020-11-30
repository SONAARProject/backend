# SONAAR Backend server

## How to test own images

In one terminal launch the web service:

```shell
npm run start:dev
```

In a second terminal run:

```shell
npm run generate:samples -- <path-to-image>
```

and then:

```shell
npm run host:samples
```

In a third terminal test the samples:

```shell
npm run test:samples -- <image-name>
```

## License

ISC
