interface DeployedContract {
  name: string;
  isUpgreadable: boolean;
  isInitializable: boolean;
  proxy?: string; // Or "impl" if contract deployed without proxy
  proxyAdmin?: string;
  impl?: string;
}

export const contracts: {
  [key: string]: {
    profile: DeployedContract;
    challenge: DeployedContract;
  };
} = {
  bscTestnet: {
    profile: {
      name: "Profile",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xaAFFe298AbE153b4B72a55BDa224F83dB6748339",
      impl: "0xaAFFe298AbE153b4B72a55BDa224F83dB6748339",
    },
    challenge: {
      name: "Challenge",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x48c33f2B2960877cBDe2cD55e97A302C8c0F5504",
      impl: "0x48c33f2B2960877cBDe2cD55e97A302C8c0F5504",
    },
  },
};
