import axios from "axios";

import {
  IPostRequestProps,
  IRequestProps,
  IResponse,
} from "@/interfaces/request";

export async function get<T>(option: IRequestProps): Promise<IResponse<T>> {
  try {
    const res = await axios.get(option.url, {
      headers: {
        Accept: "application/json",
      },
    });
    return {
      status: "success",
      data: res.data,
      message: "",
    };
  } catch (err: any) {
    let message = (err as Error).message;
    if (err.res?.error) {
      message = err.res.error;
    }
    return {
      status: "fail",
      message,
      data: null,
    };
  }
}

export async function post<T>(
  option: IPostRequestProps
): Promise<IResponse<T>> {
  try {
    const res = await axios.post(option.url, option.data || {}, {
      headers: {
        Accept: "application/json",
      },
    });
    return {
      status: "success",
      data: res.data,
      message: "",
    };
  } catch (err: any) {
    let message = (err as Error).message;
    if (err.res?.error) {
      message = err.res.error;
    }
    return {
      status: "fail",
      message,
      data: null,
    };
  }
}
