/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Sudo Password - 用于执行sudo命令的密码 */
  "sudoPassword"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `fix` command */
  export type Fix = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `fix` command */
  export type Fix = {}
}

