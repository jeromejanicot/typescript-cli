import {
  AvailableNextPackages,
  AvailableNodePackages,
  AvailablePackages,
  AvailablePackages18,
  AvailableNextPackagesTemp,
} from "../installers";

export const setPackageList = (projectType: string): AvailablePackages18[] => {
  let nodePackages: AvailableNodePackages[];
  if ((projectType = "node")) {
    nodePackages = ["dotenv", "cors", "trpc"];
    return nodePackages;
  } else if ((projectType = "next")) {
    let nextPackages: AvailableNextPackages[];
    nextPackages = ["nextAuth", "prisma", "tailwind", "trpc"];
    return nextPackages;
  }
  let nextPackages18: AvailableNextPackagesTemp[];
  nextPackages18 = ["prisma", "tailwind", "trpc"];
  return nextPackages18;
};
