export const search_with_key = <T, K extends keyof T>(key: K, value: T[K], data_list: T[]) => {
  // this function can also be used in frontend despite of this file using node modules (using treeshaking)
  for (let i = 0; i < data_list.length; i++) if (data_list[i][key] === value) return i;
  return -1;
};

export const get_val_with_key = <T, K extends keyof T>(key: K, value: T[K], data_list: T[]) => {
  const index = search_with_key(key, value, data_list);
  if (index !== -1) return data_list[index];
};
