declare module "react-h5-audio-player" {
  import { Component } from "react";
  export default class AudioPlayer extends Component<{
    src: string;
    showJumpControls?: boolean;
    layout?: string;
    customProgressBarSection?: string[];
    onError?: () => void;
    autoPlayAfterSrcChange?: boolean;
  }> {}
}
