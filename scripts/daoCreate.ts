import {
  InitializeArcJs,
  LoggingService,
  LogLevel,
  DAO,
  ConfigService,
  Web3
} from "@daostack/arc.js";

interface FounderSpec {
  /**
   * Founders' address
   */
  address: string;
  /**
   * string | number token amount to be awarded to each founder, in GEN
   */
  tokens: string | number;
  /**
   * string | number reputation amount to be awarded to each founder,
   * in units of the Genesis Reputation system.
   */
  reputation: string | number;
}

/**
 * Create a new DAO given a json spec that is the equivalent to the `NewDaoConfig`
 * expected by Arc.js's `DAO.new`.  The founder's tokens and reputation amounts
 * will be converted here into Wei.
 * @param web3 
 * @param networkName 
 * @param jsonSpecPath 
 */
export const run = async (web3: Web3, networkName: string, jsonSpecPath: string): Promise<void> => {

  if (!jsonSpecPath) {
    return Promise.reject("jsonSpecPath was not supplied")
  }

  LoggingService.logLevel = LogLevel.info | LogLevel.error;

  await InitializeArcJs();
  ConfigService.set("estimateGas", true);

  const spec = require(jsonSpecPath);

  if (!spec.founders || !spec.founders.length) {
    throw new Error("You must supply at least one founder");
  }

  spec.founders = spec.founders.map((f: FounderSpec) => {
    return {
      address: f.address,
      reputation: web3.toWei(f.reputation),
      tokens: web3.toWei(f.tokens),
    }
  });

  console.log(`creating DAO with ${spec.founders.length} founders...`);

  const dao = await DAO.new(spec);

  console.log(`new DAO created at: ${dao.avatar.address}`);
  console.log(`native token: ${dao.token.address}`);

  return Promise.resolve();
}
