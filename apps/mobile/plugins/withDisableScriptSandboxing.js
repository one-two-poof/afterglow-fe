const { withXcodeProject } = require("expo/config-plugins");

/**
 * Xcode 15+ 기본값 ENABLE_USER_SCRIPT_SANDBOXING=YES가 CocoaPods의
 * "[CP] Copy Pods Resources" 스크립트 파일쓰기(resources-to-copy-*.txt)를
 * 샌드박스로 막아 xcodebuild가 code 65로 실패한다.
 * ios/가 gitignore(CNG)라 pbxproj 직접수정은 prebuild 때 날아가므로,
 * prebuild 때마다 앱 타깃 전 빌드설정을 NO로 되돌린다.
 */
module.exports = function withDisableScriptSandboxing(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const buildSettings = configurations[key].buildSettings;
      if (buildSettings) {
        buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = "NO";
      }
    }
    return config;
  });
};
