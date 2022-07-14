import { PackageJson } from "type-fest";
import fs from "fs";
import { PackageManager } from "../utils/getUserPkgManager";

export const availableNextPackages = [
  "nextAuth",
  "prisma",
  "tailwind",
  "trpc",
] as const;

export const availableNextPackagesTemp = [
  "prisma",
  "tailwind",
  "trpc",
] as const;

export const availableNodePackages = ["dotenv", "cors", "trpc"] as const;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends Object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type AvailableNextPackages = typeof availableNextPackages[number];
export type AvailableNodePackages = typeof availableNodePackages[number];

export type AvailableNextPackagesTemp =
  typeof availableNextPackagesTemp[number];

export type AvailablePackages = XOR<
  AvailableNextPackages,
  AvailableNodePackages
>;
export type AvailablePackageTemp = XOR<
  AvailableNextPackagesTemp,
  AvailableNodePackages
>;

export type AvailablePackages18 = XOR<
  AvailablePackages,
  AvailableNextPackagesTemp
>;

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName?: string;
}

export type Installer = (opts: InstallerOptions) => Promise<void>;

export type PkgInstallerMap = {
  [pkgs in AvailablePackages18]: {
    inUse: boolean;
    installer?: Installer;
  };
};

const installerFiles = fs.readdirSync(__dirname);
const installerPackages = installerFiles.map((elem) => {
  const packageName = elem.split("iI");
  return packageName[0];
});

export const buildPkgInstallerMap = (
  packages: AvailablePackages18[]
): PkgInstallerMap => {
  let packageMap: PkgInstallerMap = {};
  for (let i = 0; i < packages.length; i++) {
    packageMap[packages[i]] = { inUse: true};
    packageMap[packages[i]]= { installer: undefined};
    if (installerPackages.includes(packages[i])) {
      packageMap[packages[i]].installer = `${packages[i]}Installer`;
    }
  }
  return packageMap;
};
