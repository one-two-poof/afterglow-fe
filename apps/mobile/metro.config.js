// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind: global.css를 입력으로 받아 Tailwind 클래스를 RN 스타일로 변환한다.
module.exports = withNativeWind(config, { input: "./global.css" });
