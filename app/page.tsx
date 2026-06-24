import ClonedSite from "./components/cloned-site";
import Overlay from "./components/overlay";

export default function Home() {
  return (
    <>
      <ClonedSite src="/site/index.html" title="Margolis PLLC" />
      <Overlay />
    </>
  );
}
