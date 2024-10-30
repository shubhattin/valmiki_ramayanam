import type * as func_types from './core/hbjs';

export type Arg<F extends keyof typeof func_types> = {
  func_name: F;
  args: Parameters<(typeof func_types)[F]>;
};

export type ArgUUID<F extends keyof typeof func_types> = {
  func_name: F;
  args: Parameters<(typeof func_types)[F]>;
  uuid: string;
};
