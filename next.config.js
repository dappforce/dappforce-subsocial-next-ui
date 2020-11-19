/* eslint-disable @typescript-eslint/no-var-requires */
// const withBundleAnalyzer = require('@next/bundle-analyzer')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')
const path = require('path')
const Dotenv = require('dotenv-webpack')

// Required by Docker
require('dotenv').config()

const nextConfig = {
  target: 'server',
  webpack: (config, { isServer }) => {

    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
    } else {
      config.node = {
        'node-hid': 'empty'
      }
    }

    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true // Required by Docker
      })
    ]

    config.module.rules.push(
      {
        test: /\.(raw)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'raw-loader'
      },
      {
        test: /\.md$/,
        use: [
          'html-loader',
          'markdown-loader'
        ]
      },
      {
        test: /\.(png|svg|eot|otf|ttf|woff|woff2|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            publicPath: '/_next/static/',
            outputPath: 'static/',
            name: '[name].[ext]'
          }
        }
      }
    )

    return config
  }
}

module.exports = withPlugins([
    withImages
  ],
  {
  ...nextConfig,
  async redirects () {
    return [
      {
        source: '/spaces/:spaceId(@.*)/:details*',
        destination: '/:spaceId/:details*',
        permanent: true,
      },
      {
        source: '/spaces/:spaceId(\\d{1,})/:details*',
        destination: '/:spaceId/:details*',
        permanent: true,
      }
      // {
      //   source: '/spaces/:spaceId/:details*',
      //   destination: '/:spaceId/:details*',
      //   permanent: true,
      // }
    ]
  }
})
