import { RoutingKeys } from "@slipperyslope/common";

export const rabbitWrapper = {
  connection: {
    createChannel: () => {},
    produce: (data: any, key: RoutingKeys) => {
      return;
    },
  },
};
