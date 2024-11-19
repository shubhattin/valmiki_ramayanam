import { client } from '~/api/client';

export const get_result_from_trigger_run_id = async <T>(run_token: string) => {
  return await new Promise<
    T & {
      time_taken: number;
    }
  >((resolve, reject) => {
    const get_info = async () => {
      const out = await client.ai.trigger_funcs.retrive_run_info.query({
        run_token: run_token!
      });
      if ('error_code' in out) {
        reject(out.error_code);
      } else if (out.completed) {
        resolve({ ...out.output, time_taken: out.time_taken });
      } else if (!out.completed) {
        // this should rerun
        set_call_timeout();
        return;
      }
    };
    const set_call_timeout = () => setTimeout(get_info, 4 * 1000);
    set_call_timeout();
  });
};
