import { auth, runs } from '@trigger.dev/sdk/v3';

export const get_result_from_trigger_dev_handle = async <T extends Object>(handle: {
  publicAccessToken: string;
  id: string;
  taskIdentifier: string;
}) => {
  auth.configure({
    accessToken: handle.publicAccessToken
  });
  for await (const run of runs.subscribeToRun(handle.id)) {
    if (run.status === 'COMPLETED') return run.output! as T;
  }
};
