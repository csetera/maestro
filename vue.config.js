module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "appId": "com.seterasoft.maestro",
                "productName": "Maestro",
                "linux": {
                    "category": "Audio"
                },
                "electronVersion": "8.5.5"
            }
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    }
}