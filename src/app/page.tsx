import { Suspense, lazy } from "react";
import Loader from "@/components/Loader";

const SwapPage = lazy(() => import('@/components/Page/Swap'));

export default function Page() {
  return <Suspense fallback={<Loader />}>
    <SwapPage />
  </Suspense>
}
