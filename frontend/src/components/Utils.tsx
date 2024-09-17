import { axios_instance } from "@/axios";

// varios utility function

export default async function isLoggedIn() {
  try {
    let response = await axios_instance.get('api/is-logged-in/');
    return response.status === 200;
  } catch {
    return false;
  }
}

// functions to translate values, say 'I', to full value sometimes used like
// ['I', 'Intermediate']

export const getStateFullName = async(state:string) => {
  const response = await axios_instance.get('api/translate-state/?key=' + state);
  return [state, response.data];
}

export const getFullDiffLevel = async(level:string) => {
  const response = await axios_instance.get('api/translate-difficulty/?key=' + level);
  return [level, response.data];
}

export const getFullRockType = async(type:string) => {
  const response = await axios_instance.get('api/translate-rock-type/?key=' + type);
  return [type, response.data];
}
