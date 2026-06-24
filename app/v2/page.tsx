import ClonedSite from "../components/cloned-site";
import Overlay from "../components/overlay";
import { lightTheme } from "../lib/overlay-ui";

// Same homepage as `/`, but the intro overlay uses the bright white
// liquid-glass theme over the meeting photo instead of the dark green card.
export default function LightHome() {
  return (
    <>
      <ClonedSite src="/site/index.html" title="Margolis PLLC" />
      <Overlay theme={lightTheme} />
    </>
  );
}
