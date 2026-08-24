// NativeWind는 className을 처리하기 위해 babel 프리셋이 필요하다.
// jsxImportSource: "nativewind" 로 JSX가 NativeWind 런타임을 거치게 하고,
// "nativewind/babel" 프리셋이 className→스타일 변환을 담당한다.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
