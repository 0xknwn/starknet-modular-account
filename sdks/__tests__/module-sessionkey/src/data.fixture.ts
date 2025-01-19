const { V1, V2, V3 } = { V1: 1, V2: 2, V3: 3 };

export const data = [
  {
    fees: "WEI",
    version: {
      invoke: V1,
      declare: V2,
      deploy_account: V1,
    },
    accountID: 0,
  },
  {
    fees: "FRI",
    version: {
      invoke: V3,
      declare: V3,
      deploy_account: V3,
    },
    accountID: 1,
  },
];
