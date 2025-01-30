import Arweave from "arweave/web";

export const arweaveInstance = new Arweave({
  host: "arweave-search.goldsky.com",
  port: 443,
  protocol: "https",
});
