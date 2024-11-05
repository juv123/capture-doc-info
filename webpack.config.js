resolve: {
    fallback: {
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "querystring": require.resolve("querystring-es3"),
        "crypto": require.resolve("crypto-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "http": require.resolve("stream-http"),
        "fs": false, // since 'fs' cannot be polyfilled in the browser
        "net": false // since 'net' cannot be polyfilled in the browser
    }
}
