import { readGallery } from "@/lib/gallery";
import { Harness } from "./harness";
export default function Page() { return <Harness visuals={readGallery("visuals")} components={readGallery("components")} />; }
