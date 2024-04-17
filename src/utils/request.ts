import axios from "axios";

import { IRequestProps, IResponse } from "@/interfaces/request";

export async function get<T>(option: IRequestProps): Promise<IResponse<T>> {
  try {
    let totalBytesReceived = 0;
    const res = await axios.get(option.url, {
      headers: {
        Accept: "application/json",
      },
      onDownloadProgress: () => {
        if (option.progress) {
          const estimatedTotalSize = 120000; // For example, 1MB
          const progress = Math.round(
            (totalBytesReceived / estimatedTotalSize) * 100
          );
          option.progress(progress);
        }
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
