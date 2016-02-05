# http-deduplicate

[![build status](https://secure.travis-ci.org/mcollina/http-deduplicate.svg)](http://travis-ci.org/mcollina/http-deduplicate)

Deduplicate multiple http request to a single endpoint.

You have an application composed of multiple HTTP servers, and you need
to issue HTTP requests from your frontend to other internal endpoints.
So, you call your endpoint for all requests. This module allows you to
reduce the traffic and response time by calling a given URL only once at
any given interval.

## Install

```
npm install http-deduplicate -g
```

## Example

```js
deduplicate(url, function (err, data, cb) {
  // do something async
  cb()
  // cb is optional and can be omitted
})
```

See [example.js](./example.js) for a full example

## API

### deduplicate(address, callback(err, data [, cb]))

Calls `address` (as defined in[http](https://nodejs.org/api/http.html#http_http_get_options_callback) and
[https](https://nodejs.org/api/https.html#https_https_get_options_callback) only once in a given period, all the other requests will receive the same data.

For extreme optimizations in high load scenarios, you can serve the
latest returned value up until all `callback` (if present) are
called.

## TODO

* [ ] HTTP headers
* [ ] HTTP caching (ETag)
* [ ] HTTP caching (Last-Modified)

## Acknowledgements

http-deduplicate is sponsored by [nearForm](http://nearform.com).

## License

MIT
