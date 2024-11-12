import load_trigger_dev_worker from './worker?worker';
import type * as functions from './trigger_dev';
import type { Arg, ArgUUID } from './types';

const trigger_dev_worker = new load_trigger_dev_worker();

// uuid: [func_name, callback]
const messages_queue: Record<string, [string, (response: any) => void]> = {};

trigger_dev_worker.onmessage = (event) => {
  const data = event.data;
  if (data.uuid in messages_queue) {
    const [func_name, resolve] = messages_queue[data.uuid];
    if (data.func_name === func_name) {
      resolve(data?.response);
      delete messages_queue[data.uuid];
    }
  }
};

async function postMessage<F extends keyof typeof functions>(message: Arg<F>) {
  return new Promise<ReturnType<(typeof functions)[F]>>((resolve, reject) => {
    const uuid = crypto.randomUUID();
    const post_message: ArgUUID<F> = {
      ...message,
      uuid
    };
    messages_queue[uuid] = [message.func_name, resolve];
    trigger_dev_worker.postMessage(post_message);
  });
}

export const get_result_from_trigger_dev_handle = async <T>(handle: {
  publicAccessToken: string;
  id: string;
  taskIdentifier: string;
}) => {
  return (await postMessage({
    func_name: 'get_result_from_trigger_dev_handle',
    args: [handle]
  })) as T;
};
