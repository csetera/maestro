module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "appId": "com.seterasoft.maestro",
                "productName": "Maestro",
                "linux": {
                    "category": "Audio"
                }
            }
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    }
}