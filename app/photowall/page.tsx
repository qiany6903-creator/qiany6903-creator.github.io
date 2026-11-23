import { siteConfig } from "../../siteConfig";
import PhotoWallClient from "./PhotoWallClient";

export const metadata = {
  title: "画册 | " + siteConfig.title,
};

export default function PhotoWallPage() {
  return <PhotoWallClient />;
}