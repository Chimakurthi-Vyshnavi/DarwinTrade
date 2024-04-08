const path = require('path')

module.exports = {
    entry : {
        'push-notifications' : './web/js/push-notifications.ts',
        'firebase-messaging-sw' : './web/js/firebase-messaging-sw.ts',
        'darwintrade' : './public/js/darwintrade.js',
    },
    devtool : 'source-map',
    output : {
        filename : '[name].js',
        path : path.resolve(__dirname, 'public'),
    },
    resolve : {
        extensions : ['.ts', '.js'],
    },
    module : {
        rules : [
            {
                test : /\.tsx?$/,
                use : 'ts-loader',
                exclude : /node_modules/
            }
        ]
    }
}