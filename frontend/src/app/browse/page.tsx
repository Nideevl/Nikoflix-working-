import { Suspense } from "react";
import BrowseClient from "@/components/browse/BrowseClient";

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowseClient />
    </Suspense>
  );
}
