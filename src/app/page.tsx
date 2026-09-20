import { Portfolio } from "@/components/v3/portfolio";
import { readGallery } from "@/lib/gallery";

export default function Home() {
  return <Portfolio visuals={readGallery("visuals")} components={readGallery("components")} />;
}
