// Metro mặc định của Expo, thêm .glb (mô hình 3D của món) vào danh sách tài nguyên.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('glb');

module.exports = config;
