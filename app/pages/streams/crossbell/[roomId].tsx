import Layout from "components/layout";
import { FullWidthSkeleton } from "components/styled";
import { useRouter } from "next/router";

/**
 * Page with a crossbell stream.
 *
 * TODO: Load account from crossbell challenge note to display stream author buttons
 *
 * TODO: Implement
 */
export default function CrossbellStream() {
  const router = useRouter();
  const { roomId } = router.query;

  return (
    <Layout maxWidth="md">
      <FullWidthSkeleton />
    </Layout>
  );
}
