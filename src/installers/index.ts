import { PackageJson } from "type-fest";
import fs from "fs";
import { PackageManager } from "../utils/getUserPkgManager";
export const availableNextPackages = [
  "nextAuth",
  "prisma",
  "tailwind",
  "trpc",
] as const;

export const availabelNextPackagesTemp = [
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
export type AvailabeNodePackages = typeof availableNodePackages[number];

export type AvailableNextPackagesTemp =
  typeof availabelNextPackagesTemp[number];

export type AvailablePackages = XOR<
  AvailableNextPackages,
  AvailabeNodePackages
>;
export type AvailabePackageTemp = XOR<
  AvailableNextPackagesTemp,
  AvailabeNodePackages
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
  projectNmae?: string;
}

export type Installer = (opts: InstallerOptions) => Promise<void>;

export type PkgInstallerMap = {
  [pkgs in AvailablePackages18]: {
    inUse: boolean;
    installer?: Installer;
  };
};

const getInstallersDir = fs.readdirSync(__dirname);
const getInstallers = getInstallersDir.map((elem) => elem.replace(/\.ts$/, ""));

export const buildPkgInstallerMap = (
  packages: AvailablePackages18[]
): PkgInstallerMap => {
  let packageMap: PkgInstallerMap;
  for (let i = 0; i < packages.length; i++) {
    // assign new key to object packageMap
    // asign bool to inUse
    if (getInstallers.includes(packages[0])) {
      // asign installer module if exist
    }
  }
  return packageMap;
};
