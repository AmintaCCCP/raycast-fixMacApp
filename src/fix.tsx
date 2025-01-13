import { ActionPanel, Action, List, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface Preferences {
  sudoPassword: string;
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [apps, setApps] = useState<string[]>([]);
  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    try {
      const appDir = "/Applications";
      const files = fs.readdirSync(appDir);
      const appNames = files
        .filter(file => file.endsWith(".app"))
        .map(file => file.replace(".app", ""));
      setApps(appNames);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "无法读取应用程序目录"
      });
    }
  }, []);

  const filteredApps = apps.filter(app => 
    app.toLowerCase().includes(searchText.toLowerCase())
  );

  const fixApp = async (appName: string) => {
    try {
      if (!preferences.sudoPassword) {
        await showToast({
          style: Toast.Style.Failure,
          title: "错误",
          message: "请先在扩展设置中配置 sudo 密码"
        });
        return;
      }

      const commands = [
        `sudo -S /usr/bin/xattr -rd com.apple.quarantine "/Applications/${appName}.app"`,
        `sudo -S /usr/bin/codesign --force --deep --sign - "/Applications/${appName}.app"`
      ];

      for (const command of commands) {
        try {
          const password = Buffer.from(preferences.sudoPassword).toString();
          execSync(`echo "${password}" | ${command}`, {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: '/bin/bash',
            encoding: 'utf8'
          });
        } catch (cmdError: any) {
          if (cmdError.stderr?.includes("try again")) {
            throw new Error("密码错误，请检查扩展设置中的密码是否正确");
          }
          throw new Error(`执行命令失败: ${cmdError.stderr || cmdError.message}`);
        }
      }

      await showToast({
        style: Toast.Style.Success,
        title: "成功",
        message: `已修复 ${appName} 的权限`
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "错误",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  return (
    <List
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="输入应用名称..."
      throttle
    >
      {filteredApps.map((app) => (
        <List.Item
          key={app}
          title={app}
          actions={
            <ActionPanel>
              <Action title="修复权限" onAction={() => fixApp(app)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
} 